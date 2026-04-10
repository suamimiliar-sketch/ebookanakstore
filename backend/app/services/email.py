"""Email delivery service — sends download links after successful payment."""
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()


def _build_html(order) -> str:
    """Build a branded HTML email with download links."""
    items_html = ""
    for item in order.items:
        link = item.drive_download_link or ""
        if link:
            items_html += f"""
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;font-size:14px;color:#1A2E40;">
                {item.title}
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
                {item.title}
              </td>
              <td style="padding:12px 16px;border-bottom:1px solid #f0ebe0;text-align:center;
                          font-size:12px;color:#999;">
                Link segera tersedia
              </td>
            </tr>"""

    discount_row = ""
    if order.discount > 0:
        discount_row = f"""
        <tr>
          <td style="padding:8px 0;color:#1A2E40;font-size:14px;">Diskon Bundle 20%</td>
          <td style="padding:8px 0;text-align:right;color:#e74c3c;font-size:14px;font-weight:700;">
            -Rp {order.discount:,}
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:'Nunito',Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:24px;overflow:hidden;
              box-shadow:0 4px 24px rgba(43,79,110,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FFBB00,#F5A030);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;font-size:24px;color:#1A2E40;font-weight:800;">Pelangi Pintar</h1>
      <p style="margin:8px 0 0;font-size:14px;color:#1A2E40;opacity:0.8;">Terima kasih atas pembelianmu!</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <p style="font-size:15px;color:#1A2E40;line-height:1.6;margin:0 0 8px;">
        Halo <strong>{order.customer_name}</strong>,
      </p>
      <p style="font-size:14px;color:#2B4F6E;line-height:1.6;margin:0 0 24px;">
        Pembayaran untuk order <strong>{order.order_id}</strong> berhasil!
        Berikut link download produk yang kamu beli:
      </p>

      <!-- Products table -->
      <table style="width:100%;border-collapse:collapse;background:#FDFBF6;border-radius:16px;overflow:hidden;">
        <thead>
          <tr style="background:#FFF8E0;">
            <th style="padding:12px 16px;text-align:left;font-size:12px;color:#7A5700;
                        text-transform:uppercase;letter-spacing:0.5px;">Produk</th>
            <th style="padding:12px 16px;text-align:center;font-size:12px;color:#7A5700;
                        text-transform:uppercase;letter-spacing:0.5px;">Link</th>
          </tr>
        </thead>
        <tbody>
          {items_html}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="width:100%;margin-top:20px;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#2B4F6E;font-size:14px;">Subtotal</td>
          <td style="padding:8px 0;text-align:right;color:#1A2E40;font-size:14px;">
            Rp {order.subtotal:,}
          </td>
        </tr>
        {discount_row}
        <tr style="border-top:2px solid #FFBB00;">
          <td style="padding:12px 0;color:#1A2E40;font-size:16px;font-weight:800;">Total</td>
          <td style="padding:12px 0;text-align:right;color:#1A2E40;font-size:16px;font-weight:800;">
            Rp {order.total:,}
          </td>
        </tr>
      </table>

      <p style="margin:24px 0 0;font-size:13px;color:#2B4F6E;line-height:1.6;">
        Simpan email ini sebagai bukti pembelian. Link download tidak memiliki batas waktu.
        Jika ada kendala, balas email ini atau hubungi kami.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F5EFE0;padding:20px 24px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#2B4F6E;">
        &copy; Pelangi Pintar &mdash; ebookanak.store
      </p>
    </div>
  </div>
</body>
</html>"""


def send_delivery_email(order) -> bool:
    """Send product download links to the customer. Returns True on success."""
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        log.warning("SMTP not configured — skipping delivery email for %s", order.order_id)
        return False

    html = _build_html(order)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Download Ebook Kamu — {order.order_id}"
    sender = settings.NOTIFY_FROM or settings.SMTP_USER
    msg["From"] = f"Pelangi Pintar <{sender}>"
    msg["To"] = order.customer_email
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        log.info("Delivery email sent to %s for order %s", order.customer_email, order.order_id)
        return True
    except Exception as e:
        log.error("Failed to send delivery email for %s: %s", order.order_id, e)
        return False
