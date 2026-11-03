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

# Read by Grafana through GF_SECURITY_ADMIN_PASSWORD__FILE, as a member of group 1000.
template {
  destination          = "/secrets/grafana_password"
  perms                = "0440"
  error_on_missing_key = true
  contents             = "{{ with secret \"secret/data/grafana/config\" }}{{ .Data.data.GRAFANA_PASSWORD }}{{ end }}"
}
