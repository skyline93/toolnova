export type DesensitizeRuleKey =
  | "phone"
  | "idCard"
  | "email"
  | "bankCard"
  | "ip"
  | "name"
  | "password"
  | "dbUri"
  | "webhook";

export const DESENSITIZE_RULE_ORDER: DesensitizeRuleKey[] = [
  "password",
  "dbUri",
  "webhook",
  "idCard",
  "phone",
  "bankCard",
  "email",
  "ip",
  "name",
];

export const ALL_DESENSITIZE_RULE_KEYS: DesensitizeRuleKey[] = [
  "phone",
  "idCard",
  "email",
  "bankCard",
  "ip",
  "name",
  "password",
  "dbUri",
  "webhook",
];

export const MAX_DESENSITIZE_CHARS = 100_000;

const COMMON_SURNAMES =
  "王李张刘陈杨黄赵周吴徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤";

const DB_SCHEMES =
  /^(mysql|postgresql|postgres|mongodb\+srv|mongodb|redis|mariadb|sqlserver|oracle|clickhouse|amqp|cockroachdb|jdbc:[a-z0-9+.-]+):\/\//i;

type ExcludePattern =
  | { type: "regex"; re: RegExp }
  | { type: "literal"; text: string };

function maskMiddle(str: string, keepStart: number, keepEnd: number, char = "*"): string {
  if (str.length <= keepStart + keepEnd) {
    return char.repeat(str.length);
  }
  const mid = str.length - keepStart - keepEnd;
  return str.slice(0, keepStart) + char.repeat(mid) + str.slice(-keepEnd);
}

function isLikelyChineseName(name: string): boolean {
  if (!/^[\u4e00-\u9fa5]{2,4}$/.test(name)) return false;
  return COMMON_SURNAMES.includes(name[0]!);
}

function maskUserSegment(user: string): string {
  if (!user) return "";
  if (user.length <= 2) return "**";
  return user[0]! + "*".repeat(Math.min(user.length - 1, 4));
}

function maskQuerySecrets(queryPart: string): string {
  return queryPart.replace(
    /([?&](?:password|passwd|pwd|pass|secret|token|user|username)=)([^&\s#"'<>]+)/gi,
    (_, key, val: string) => {
      if (/^(user|username)$/i.test(key.replace(/[?&=]/g, ""))) {
        return key + maskUserSegment(val);
      }
      return key + "******";
    },
  );
}

function maskConnectionUri(uri: string): string {
  if (!DB_SCHEMES.test(uri) && !/^jdbc:/i.test(uri)) {
    return maskMiddle(uri, 6, 4);
  }

  const match = uri.match(/^([a-z+.+]+:\/\/)(?:(?:([^:@/?#]*)(?::([^@/?#]*))?)@)?([^\s?#]+)(.*)$/i);
  if (!match) return maskMiddle(uri, 8, 4);

  const [, proto, user, pass, hostAndPath, rest] = match;
  let out = proto!;

  if (user !== undefined || pass !== undefined) {
    const u = maskUserSegment(user || "");
    if (pass !== undefined && pass !== "") {
      out += `${u}:******@`;
    } else if (pass === "") {
      out += `:@`;
    } else if (u) {
      out += `${u}@`;
    }
  }

  out += hostAndPath!;
  out += maskQuerySecrets(rest!);
  return out;
}

function maskWebhookUrl(url: string): string {
  let out = url;

  out = out.replace(
    /([?&](?:access_token|secret|token|key)=)([^&\s#"'<>]+)/gi,
    (_, key, val: string) => key + maskMiddle(val, 4, 4),
  );

  if (/\/hook\/[a-zA-Z0-9_-]+/i.test(out)) {
    out = out.replace(/(\/hook\/)([a-zA-Z0-9_-]+)/gi, (_, pre, token: string) => pre + maskMiddle(token, 4, 4));
  }

  if (/hooks\.slack\.com\/services\//i.test(out)) {
    out = out.replace(/\/([^/?#]+)$/i, (_, seg: string) => "/" + "*".repeat(Math.min(seg.length, 12)));
  }

  if (/discord(?:app)?\.com\/api\/webhooks\//i.test(out)) {
    out = out.replace(
      /\/api\/webhooks\/(\d+)\/([a-zA-Z0-9_-]+)/i,
      (_, id, token: string) => `/api/webhooks/${id}/${maskMiddle(token, 0, 4)}`,
    );
  }

  if (/\/webhooks?\//i.test(out) && !/\/hook\//i.test(out)) {
    out = out.replace(
      /(\/webhooks?\/)([a-zA-Z0-9][a-zA-Z0-9_.-]+)/gi,
      (_, pre, token: string) => pre + maskMiddle(token, 4, 4),
    );
  }

  return out;
}

type RuleResult = { text: string; count: number };

const rules: Record<DesensitizeRuleKey, (text: string, enabled: boolean) => RuleResult> = {
  phone(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const next = text.replace(
      /(?<![0-9])(?:\+?86[-\s]?)?(1[3-9]\d)[-\s]?(\d{4})[-\s]?(\d{4})(?![0-9])/g,
      (_, a: string, _b: string, c: string) => {
        count++;
        return `${a}****${c}`;
      },
    );
    return { text: next, count };
  },

  idCard(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const next = text.replace(
      /(?<![0-9A-Za-z])[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx](?![0-9A-Za-z])/gi,
      (match) => {
        count++;
        return maskMiddle(match, 6, 4);
      },
    );
    return { text: next, count };
  },

  email(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const next = text.replace(
      /(?<![\w.-])([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?![\w.-])/g,
      (_match, local: string, domain: string) => {
        count++;
        const maskedLocal =
          local.length <= 1 ? "*" : local[0]! + "*".repeat(Math.min(local.length - 1, 6));
        return `${maskedLocal}@${domain}`;
      },
    );
    return { text: next, count };
  },

  bankCard(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const next = text.replace(/(?<![0-9])(\d{13,19})(?![0-9])/g, (match) => {
      if (/^1[3-9]\d{9}$/.test(match)) return match;
      if (/^[1-9]\d{5}(18|19|20)\d{2}/.test(match) && match.length === 18) return match;
      count++;
      return maskMiddle(match, 4, 4);
    });
    return { text: next, count };
  },

  ip(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const next = text.replace(
      /\b((?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3})\b/g,
      (match) => {
        count++;
        const parts = match.split(".");
        return `${parts[0]}.${parts[1]}.*.*`;
      },
    );
    return { text: next, count };
  },

  password(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const patterns = [
      /(password|passwd|pwd|密码|口令)\s*[:：=]\s*(\S+)/gi,
      /(secret|token|api[_-]?key|access[_-]?key)\s*[:：=]\s*(\S+)/gi,
    ];
    let next = text;
    for (const re of patterns) {
      next = next.replace(re, (full, label: string) => {
        count++;
        const sep = full.match(/[:：=]/)![0]!;
        return `${label}${sep}******`;
      });
    }
    return { text: next, count };
  },

  name(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const next = text.replace(
      /(?:^|[\s，,。；;：:【\[\(（「『"'“]|联系人[:：]?|姓名[:：]?|叫做?|名为)([\u4e00-\u9fa5]{2,4})(?=[\s，,。；;：:】\]\)）」』"'”\d]|$)/g,
      (full, name: string) => {
        if (!isLikelyChineseName(name)) return full;
        const prefix = full.slice(0, full.length - name.length);
        count++;
        const masked = name[0]! + "*".repeat(name.length - 1);
        return prefix + masked;
      },
    );
    return { text: next, count };
  },

  dbUri(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;

    const schemeUri =
      /(?<![\w/])(mysql|postgresql|postgres|mongodb\+srv|mongodb|redis|mariadb|sqlserver|oracle|clickhouse|amqp|cockroachdb):\/\/[^\s"'<>)\]]+/gi;
    let next = text.replace(schemeUri, (uri) => {
      count++;
      return maskConnectionUri(uri);
    });

    next = next.replace(/jdbc:[a-z0-9+.-]+:\/\/[^\s"'<>)\]]+/gi, (uri) => {
      count++;
      return maskConnectionUri(uri);
    });

    next = next.replace(
      /((?:DATABASE_URL|DB_URL|REDIS_URL|MONGO_URL|MYSQL_URL|POSTGRES_URL)\s*=\s*)([^\s"'<>]+)/gi,
      (_, prefix, uri: string) => {
        count++;
        return prefix + maskConnectionUri(uri);
      },
    );

    return { text: next, count };
  },

  webhook(text, enabled) {
    if (!enabled) return { text, count: 0 };
    let count = 0;
    const patterns = [
      /https?:\/\/open\.feishu\.cn\/open-apis\/bot\/v\d+\/hook\/[a-zA-Z0-9_-]+/gi,
      /https?:\/\/open\.larksuite\.com\/open-apis\/bot\/v\d+\/hook\/[a-zA-Z0-9_-]+/gi,
      /https?:\/\/hooks\.slack\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[a-zA-Z0-9_-]+/gi,
      /https?:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+/gi,
      /https?:\/\/oapi\.dingtalk\.com\/robot\/send\?access_token=[a-zA-Z0-9_-]+/gi,
      /https?:\/\/qyapi\.weixin\.qq\.com\/cgi-bin\/webhook\/send\?key=[a-zA-Z0-9_-]+/gi,
      /https?:\/\/[^\s"'<>]*\/(?:hook|webhooks?)\/[a-zA-Z0-9][a-zA-Z0-9_.-]{7,}/gi,
    ];

    let next = text;
    for (const re of patterns) {
      next = next.replace(re, (url) => {
        count++;
        return maskWebhookUrl(url);
      });
    }

    next = next.replace(
      /((?:webhook|hook|callback)\s*[_-]?(?:url|uri)?\s*[:=]\s*)(https?:\/\/\S+)/gi,
      (_, prefix, url: string) => {
        count++;
        return prefix + maskWebhookUrl(url);
      },
    );

    return { text: next, count };
  },
};

export function parseExcludeRules(raw: string): ExcludePattern[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((pattern) => {
      if (pattern.startsWith("/") && pattern.length > 2) {
        const lastSlash = pattern.lastIndexOf("/");
        if (lastSlash > 0) {
          const body = pattern.slice(1, lastSlash);
          const flags = pattern.slice(lastSlash + 1);
          try {
            return { type: "regex" as const, re: new RegExp(body, flags) };
          } catch {
            return { type: "literal" as const, text: pattern };
          }
        }
      }
      return { type: "literal" as const, text: pattern };
    });
}

function isLineExcluded(line: string, patterns: ExcludePattern[], ignoreCase: boolean): boolean {
  for (const p of patterns) {
    if (p.type === "regex") {
      p.re.lastIndex = 0;
      if (p.re.test(line)) return true;
    } else if (ignoreCase) {
      if (line.toLowerCase().includes(p.text.toLowerCase())) return true;
    } else if (line.includes(p.text)) {
      return true;
    }
  }
  return false;
}

function applyRulesToText(text: string, enabled: Set<DesensitizeRuleKey>): RuleResult {
  let result = text;
  let total = 0;
  for (const key of DESENSITIZE_RULE_ORDER) {
    const r = rules[key](result, enabled.has(key));
    result = r.text;
    total += r.count;
  }
  return { text: result, count: total };
}

export type DesensitizeResult = {
  text: string;
  total: number;
  excludedLines: number;
};

export function desensitizeText(
  input: string,
  enabled: Set<DesensitizeRuleKey>,
  excludeRaw: string,
  excludeIgnoreCase: boolean,
): DesensitizeResult {
  const excludePatterns = parseExcludeRules(excludeRaw);
  const endsWithNewline = input.endsWith("\n");
  const lines = input.split("\n");
  const outputLines: string[] = [];
  let total = 0;
  let excludedLines = 0;

  for (const line of lines) {
    if (excludePatterns.length > 0 && isLineExcluded(line, excludePatterns, excludeIgnoreCase)) {
      outputLines.push(line);
      excludedLines++;
      continue;
    }
    const { text, count: n } = applyRulesToText(line, enabled);
    outputLines.push(text);
    total += n;
  }

  let text = outputLines.join("\n");
  if (endsWithNewline && input.length > 0) {
    text += "\n";
  }

  return { text, total, excludedLines };
}
