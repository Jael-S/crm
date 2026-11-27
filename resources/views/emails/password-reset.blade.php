<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - UNEXO CRM</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }
    .container {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px border #e2e8f0;
    }
    .header {
      background-color: #0a2540;
      padding: 28px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      letter-spacing: 0.5px;
      font-weight: 800;
    }
    .header p {
      margin: 4px 0 0;
      font-size: 11px;
      color: #00b4d8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
    }
    .content h2 {
      margin-top: 0;
      color: #0f172a;
      font-size: 18px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      background-color: #0284c7;
      color: #ffffff !important;
      text-decoration: none;
      padding: 13px 28px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);
    }
    .warning {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 20px 0;
      font-size: 12px;
      color: #92400e;
      border-radius: 4px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 28px;
      font-size: 11px;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .break-url {
      word-break: break-all;
      color: #0284c7;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>UNEXO CRM</h1>
      <p>Unidad de Emprendimiento y Tecnología Avanzada</p>
    </div>
    <div class="content">
      <h2>Hola, {{ $usuario->nombre_completo }}</h2>
      <p>
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>UNEXO CRM</strong>.
      </p>
      <p>
        Para continuar y elegir una nueva contraseña de acceso, haz clic en el siguiente botón:
      </p>
      <div class="button-container">
        <a href="{{ $resetUrl }}" class="button">Restablecer mi Contraseña</a>
      </div>
      <div class="warning">
        <strong>Enlace Temporal:</strong> Este enlace es seguro y expirará automáticamente en <strong>30 minutos</strong>. Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.
      </div>
      <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
        Si tienes problemas con el botón, copia y pega el siguiente enlace directamente en tu navegador:
      </p>
      <p class="break-url">{{ $resetUrl }}</p>
    </div>
    <div class="footer">
      UNEXO CRM · Formación Continua 2026<br>
      Este es un correo automático del sistema, por favor no respondas a esta dirección.
    </div>
  </div>
</body>
</html>
