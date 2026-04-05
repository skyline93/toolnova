import { SITE_CONTENT_PADDING_X } from "@/lib/site-layout";
import { Container, type ContainerProps } from "@radix-ui/themes";

export type SitePageContainerProps = Omit<ContainerProps, "size" | "px">;

/** 与工具页同宽的主内容区；新增页面优先使用本组件。 */
export function SitePageContainer({ children, ...props }: SitePageContainerProps) {
  return (
    <Container size="4" px={SITE_CONTENT_PADDING_X} {...props}>
      {children}
    </Container>
  );
}
