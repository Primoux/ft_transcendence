#!/bin/sh

# Vault prompts for each key itself: it is never echoed, nor passed as a command argument.
# `vault status` exits with 0 when unsealed, 2 when sealed, and 1 on error.
while :; do
    status=0
    docker compose exec -T vault vault status < /dev/null > /dev/null 2>&1 || status=$?
    case $status in
        0) echo "Vault is unsealed."; exit 0 ;;
        2) docker compose exec vault vault operator unseal || exit 1 ;;
        *) echo "Cannot reach Vault: is the vault container running?" >&2; exit 1 ;;
    esac
done
