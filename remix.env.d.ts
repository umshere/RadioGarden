/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare module "*.css?url" {
  const content: string;
  export default content;
}
