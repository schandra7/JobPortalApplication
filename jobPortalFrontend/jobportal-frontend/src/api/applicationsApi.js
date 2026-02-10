import axiosClient from "./axiosClient";

export const applyApi = ({ jobId, userId }) =>
  axiosClient.post("/applications/apply", null, { params: { jobId, userId } });

export const withdrawApi = ({ applicationId, userId }) =>
  axiosClient.post(`/applications/${applicationId}/withdraw`, null, { params: { userId } });

export const myAppsApi = ({ userId }) =>
  axiosClient.get("/applications/me", { params: { userId } });