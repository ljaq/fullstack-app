export const authority = {
  getXSRF: '/api/abp/application-configuration',
  userInfo: '/api/app/product-waste-personal-center/product-waste-personal-center-info',
  login: '/connect/token',
}

export const zbt = {
  userInfo: {
    method: 'GET',
    url: '/api/app/user-manage/{id}/user-info',
  },
}
