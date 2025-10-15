//  회사 관련 타입 정의
export interface CreateCompanyDto {
  companyName: string;
  companyCode: string;
}
export interface UpdateCompanyDto {
  companyName?: string;
  companyCode?: string;
}
