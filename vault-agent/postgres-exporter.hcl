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

# The postgres_exporter role's password: read by the exporter through DATA_SOURCE_PASS_FILE, as a member
# of group 1000, and by Postgres's entrypoint as root, to create the role.
template {
  destination          = "/secrets/password"
  perms                = "0440"
  error_on_missing_key = true
  contents             = "{{ with secret \"secret/data/postgres-exporter/config\" }}{{ .Data.data.EXPORTER_PASSWORD }}{{ end }}"
}
