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

template {
  destination          = "/secrets/db_password"
  perms                = "0400"
  error_on_missing_key = true
  contents             = "{{ with secret \"secret/data/postgres/config\" }}{{ .Data.data.DB_PASSWORD }}{{ end }}"
}
