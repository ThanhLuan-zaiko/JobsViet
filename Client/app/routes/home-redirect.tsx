import { redirect } from "react-router";

export default function HomeRedirect() {
  return null;
}

export function meta() {
  return [
    { title: "Redirecting..." },
    { name: "description", content: "Redirecting to home page" },
  ];
}
