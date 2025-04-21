import customizeAxios from "../component/customizeAxios";

const getAllPermissionService = async () => {
  const response = await customizeAxios.get(`/api/getAllPermission`);
  return response;
};

export { getAllPermissionService };
