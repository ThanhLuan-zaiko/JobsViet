import { redirect } from "react-router";

export default function HomeRedirect() {
  return null;
}

export function clientLoader() {
  return redirect("/");
}
