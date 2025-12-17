import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/home", "routes/home-redirect.tsx"),
  route("/trending", "routes/trending.tsx"),
  route("/history", "routes/history.tsx"),
  route("/suggested", "routes/suggested.tsx"),
  route("/following", "routes/following.tsx"),
  route("/post-job", "routes/post-job.tsx"),
  route("/manage-jobs", "routes/manage-jobs.tsx"),
  route("/manage-profile", "routes/manage-profile.tsx"),
  route("/applicants", "routes/applicants.tsx"),
  route("/job/:jobGuid", "routes/job-detail.tsx"),
] satisfies RouteConfig;
