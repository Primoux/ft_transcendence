vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    config = {
      role_id_file_path                   = "/creds/role_id"
      secret_id_file_path                 = "/creds/secret_id"
      remove_secret_id_file_after_reading = false
    }
  }
}

# The agent renews the certificate before it expires.
template {
  destination = "/secrets/cert.pem"
  perms       = "0440"
  contents    = <<-EOT
    {{- with pkiCert "pki/issue/frontend" "common_name=localhost" "ip_sans=127.0.0.1" "ttl=720h" -}}
    {{ .Cert }}{{ .CA }}
    {{ .Key | writeToFile "/secrets/key.pem" "100" "1000" "0440" }}
    {{- end -}}
  EOT
}