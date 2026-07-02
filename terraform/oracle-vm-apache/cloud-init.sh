#!/bin/bash
set -eux

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y apache2

systemctl enable apache2
systemctl start apache2

cat > /var/www/html/index.html <<'HTML'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Terraform Oracle Cloud</title>
</head>
<body>
  <h1>Servidor Apache desplegado con Terraform en Oracle Cloud</h1>
  <p>Proyecto: PreservedHub / Terraform OCI</p>
  <p>Este servidor fue creado automaticamente usando Terraform, Oracle Cloud Infrastructure y cloud-init.</p>
</body>
</html>
HTML