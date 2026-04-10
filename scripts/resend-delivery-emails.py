"""Resend delivery emails for all paid orders that were completed before
the email feature was deployed.

Run:
    ADMIN_PASSWORD='...' python scripts/resend-delivery-emails.py          # dry-run
    ADMIN_PASSWORD='...' python scripts/resend-delivery-emails.py --send   # actually send
"""
from __future__ import annotations

import argparse
import os
import smtplib
import sys
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

import requests

REPO_ROOT = Path(__file__).resolve().parent.parent

API_URL = os.environ.get("API_URL", "https://ebookanakstore-production.up.railway.app")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@ebookanak.store")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def login() -> str:
    r = requests.post(
        f"{API_URL}/api/v1/admin/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["access_token"]


def list_orders(token: str) -> list[dict]:
    r = requests.get(
        f"{API_URL}/api/v1/admin/orders",
        headers={"Authorization": f"Bearer {token}"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def build_html(order: dict) -> str:
    items_html = ""
    for item in order.get("items", []):
        link = item.get("drive_download_link") or ""
        title = item.get("title", "")
        if link:
            items_html += f"""
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#1A2E40;">
                {title}
              </td>
              <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;text-align:center;">
                <a href="{link}"
                   style="display:inline-block;padding:8px 20px;background:#FFBB00;color:#1A2E40;
                          border-radius:20px;text-decoration:none;font-weight:700;font-size:13px;">
                  Download
                </a>
              </td>
            </tr>"""
        else:
            items_html += f"""
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#1A2E40;">
                {title}
              </td>
              <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;text-align:center;
                          font-size:12px;color:#999;">
                Link segera tersedia
              </td>
            </tr>"""

    discount_row = ""
    discount = order.get("discount", 0)
    if discount > 0:
        discount_row = f"""
        <tr>
          <td style="padding:8px 0;color:#1A2E40;font-size:14px;">Diskon Bundle 20%</td>
          <td style="padding:8px 0;text-align:right;color:#e74c3c;font-size:14px;font-weight:700;">
            -Rp {discount:,}
          </td>
        </tr>"""

    name = order.get("customer_name", "")
    order_id = order.get("order_id", "")
    subtotal = order.get("subtotal", 0)
    total = order.get("total", 0)

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:24px;overflow:hidden;
              box-shadow:0 4px 24px rgba(43,79,110,0.08);">
    <div style="background:linear-gradient(135deg,#FFBB00,#F5A030);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#1A2E40;font-weight:800;">Pelangi Pintar</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#1A2E40;opacity:0.8;">Terima kasih atas pembelianmu!</p>
    </div>
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#1A2E40;line-height:1.6;margin:0 0 8px;">
        Halo <strong>{name}</strong>,
      </p>
      <p style="font-size:14px;color:#2B4F6E;line-height:1.6;margin:0 0 24px;">
        Pembayaran untuk order <strong>{order_id}</strong> berhasil!
        Berikut link download produk yang kamu beli:
      </p>
      <table style="width:100%;border-collapse:collapse;background:#FDFBF6;border-radius:16px;overflow:hidden;">
        <thead>
          <tr style="background:#FFF8E0;">
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#7A5700;
                        text-transform:uppercase;letter-spacing:0.5px;">Produk</th>
            <th style="padding:12px 16px;text-align:center;font-size:12px;color:#7A5700;
                        text-transform:uppercase;letter-spacing:0.5px;">Link</th>
          </tr>
        </thead>
        <tbody>{items_html}</tbody>
      </table>
      <table style="width:100%;margin-top:20px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#2B4F6E;font-size:14px;">Subtotal</td>
          <td style="padding:8px 0;text-align:right;color:#1A2E40;font-size:14px;">Rp {subtotal:,}</td>
        </tr>
        {discount_row}
        <tr style="border-top:2px solid #FFBB00;">
          <td style="padding:12px 0;color:#1A2E40;font-size:16px;font-weight:800;">Total</td>
          <td style="padding:12px 0;text-align:right;color:#1A2E40;font-size:16px;font-weight:800;">Rp {total:,}</td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#2B4F6E;line-height:1.6;">
        Simpan email ini sebagai bukti pembelian. Link download tidak memiliki batas waktu.
        Jika ada kendala, balas email ini atau hubungi kami.
      </p>
    </div>
    <div style="background:#F5EFE0;padding:20px 24px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#2B4F6E;">&copy; Pelangi Pintar &mdash; ebookanak.store</p>
    </div>
  </div>
</body>
</html>"""


def send_email(smtp_cfg: dict, to_email: str, order_id: str, html: str) -> bool:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Download Ebook Kamu — {order_id}"
    sender = smtp_cfg["from"] or smtp_cfg["user"]
    msg["From"] = f"Pelangi Pintar <{sender}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(smtp_cfg["host"], int(smtp_cfg["port"]), timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_cfg["user"], smtp_cfg["password"])
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"  SMTP error: {e}")
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--send", action="store_true", help="Actually send emails (default: dry-run)")
    args = ap.parse_args()

    if not ADMIN_PASSWORD:
        print("ADMIN_PASSWORD env var required", file=sys.stderr)
        sys.exit(2)

    env = load_env(REPO_ROOT / "backend" / ".env")
    smtp_cfg = {
        "host": env.get("SMTP_HOST", ""),
        "port": env.get("SMTP_PORT", "587"),
        "user": env.get("SMTP_USER", ""),
        "password": env.get("SMTP_PASSWORD", ""),
        "from": env.get("NOTIFY_FROM", "noreply@ebookanak.store"),
    }

    if args.send and not smtp_cfg["host"]:
        print("SMTP_HOST not set in backend/.env", file=sys.stderr)
        sys.exit(2)

    token = login()
    orders = list_orders(token)

    paid = [o for o in orders if o.get("payment_status") == "success"]
    print(f"Total orders: {len(orders)}, paid: {len(paid)}\n")

    if not paid:
        print("No paid orders to resend.")
        return

    for o in paid:
        email = o.get("customer_email", "?")
        oid = o.get("order_id", "?")
        n_items = len(o.get("items", []))
        print(f"  {oid}  {email:<35}  {n_items} items  total=Rp {o.get('total', 0):,}")

        if args.send:
            html = build_html(o)
            ok = send_email(smtp_cfg, email, oid, html)
            print(f"    -> {'sent' if ok else 'FAILED'}")

    if not args.send:
        print(f"\n(dry-run — pass --send to deliver {len(paid)} emails)")


if __name__ == "__main__":
    main()
