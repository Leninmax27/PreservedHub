data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = var.tamano_vm
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_vcn" "vcn" {
  compartment_id = var.compartment_ocid
  display_name   = "vcn-preservedhub-terraform"
  cidr_block     = "10.0.0.0/16"
  dns_label      = "preservedhub"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "igw-preservedhub"
  enabled        = true
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "rt-publica-preservedhub"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_security_list" "public_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "sl-http-preservedhub"

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"

    tcp_options {
      min = 80
      max = 80
    }

    description = "Permitir trafico HTTP entrante"
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"

    tcp_options {
      min = 22
      max = 22
    }

    description = "Permitir conexion SSH"
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
    description = "Permitir salida a internet"
  }
}

resource "oci_core_subnet" "public_subnet" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.vcn.id
  display_name               = "subnet-publica-preservedhub"
  cidr_block                 = "10.0.1.0/24"
  dns_label                  = "publica"
  route_table_id             = oci_core_route_table.public_rt.id
  security_list_ids          = [oci_core_security_list.public_sl.id]
  prohibit_public_ip_on_vnic = false
}

resource "oci_core_instance" "web_vm" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "vm-web-preservedhub"
  shape               = var.tamano_vm

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    display_name     = "vnic-web-preservedhub"
    hostname_label   = "webpreservedhub"
  }

  metadata = {
    ssh_authorized_keys = file(var.ssh_public_key_path)
    user_data           = base64encode(file("${path.module}/cloud-init.sh"))
  }

  preserve_boot_volume = false
}

data "oci_core_vnic_attachments" "web_vm_vnics" {
  compartment_id = var.compartment_ocid
  instance_id    = oci_core_instance.web_vm.id

  depends_on = [oci_core_instance.web_vm]
}

data "oci_core_vnic" "web_vm_vnic" {
  vnic_id = data.oci_core_vnic_attachments.web_vm_vnics.vnic_attachments[0].vnic_id

  depends_on = [data.oci_core_vnic_attachments.web_vm_vnics]
}

output "ip_publica_vm" {
  description = "Direccion IP publica asignada a la maquina virtual."
  value       = data.oci_core_vnic.web_vm_vnic.public_ip_address
}

output "url_apache" {
  description = "URL para probar el servidor Apache."
  value       = "http://${data.oci_core_vnic.web_vm_vnic.public_ip_address}"
}