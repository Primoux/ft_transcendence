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

# Sourced by backend/entrypoint.sh.
template {
  destination          = "/secrets/backend.env"
  perms                = "0440"
  error_on_missing_key = true
  contents             = <<-EOT
    {{ with secret "secret/data/backend/config" }}
    export DATABASE_URL='{{ .Data.data.DATABASE_URL }}'
    export JWT_SECRET='{{ .Data.data.JWT_SECRET }}'
    {{ end }}
  EOT
}
