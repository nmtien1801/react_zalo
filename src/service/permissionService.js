import customizeAxios from "../component/customizeAxios";

const getAllPermissionService = async () => {
  const response = await customizeAxios.get(`/api/getAllPermission`);
  return response;
};

const updateDeputyService = async (members) => {
  const response = await customizeAxios.post(`/api/updateDeputy`, { members });
  return response;
};

const transLeaderService = async (groupId, newLeaderId) => {
  const response = await customizeAxios.post(`/api/transLeader`, {
    groupId,
    newLeaderId,
  });
  return response;
};

export { getAllPermissionService, updateDeputyService, transLeaderService };
