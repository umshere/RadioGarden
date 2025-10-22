/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare module "*.css?url" {
  const content: string;
  export default content;
}
