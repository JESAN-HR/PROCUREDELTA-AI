import { notFound } from "next/navigation";
import Workspace from "@/components/workspace";
const routes = [
  "analyze",
  "comparison",
  "documents",
  "history",
  "dashboard",
  "evidence",
  "architecture",
  "security",
  "docs",
];
export function generateStaticParams() {
  return routes.map((route) => ({ route }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  if (!routes.includes(route)) notFound();
  return <Workspace route={route} />;
}
