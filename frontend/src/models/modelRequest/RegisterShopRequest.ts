export interface RegisterShopRequest {
  name: string;
  phone: string;
  description: string;
  identificationF: File | Blob;
  identificationB: File | Blob;
}
