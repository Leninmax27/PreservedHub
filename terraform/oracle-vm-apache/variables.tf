variable "region" {
  description = "Region de Oracle Cloud donde se desplegaran los recursos."
  type        = string
  default     = "sa-bogota-1"
}

variable "oci_profile" {
  description = "Perfil del archivo de configuracion OCI."
  type        = string
  default     = "DEFAULT"
}

variable "tenancy_ocid" {
  description = "OCID del tenancy de Oracle Cloud."
  type        = string
}

variable "compartment_ocid" {
  description = "OCID del compartment donde se crearan los recursos."
  type        = string
}

variable "tamano_vm" {
  description = "Tipo de maquina virtual en Oracle Cloud."
  type        = string
  default     = "VM.Standard.E2.1.Micro"
}

variable "ssh_public_key_path" {
  description = "Ruta de la llave publica SSH para acceder a la VM."
  type        = string
  default     = "C:/Users/eysadmin/.ssh/oci_tf_key.pub"
}