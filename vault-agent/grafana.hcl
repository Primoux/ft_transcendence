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

# Read by Grafana's alerting provisioning through $__file{} (grafana/provisioning/alerting/contactpoints.yml).
# Set by hand with `vault kv patch secret/grafana/config DISCORD_WEBHOOK_URL=-`: until then,
# a dead URL keeps Grafana bootable (alerts are evaluated but not delivered).
template {
  destination          = "/secrets/discord_webhook_url"
  perms                = "0440"
  error_on_missing_key = false
  contents             = "{{ with secret \"secret/data/grafana/config\" }}{{ or .Data.data.DISCORD_WEBHOOK_URL \"https://discord.invalid/webhook-not-configured\" | trimSpace }}{{ end }}"
}
