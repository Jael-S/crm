# 🚀 GUÍA DE DESPLIEGUE EN AWS EC2 (DEMO Y EVALUACIÓN)
## CRM Educativo UNEXO | INF513 - Tecnología Web
**Stack:** React (Inertia.js) + Laravel 11/12 (PHP 8.4) + PostgreSQL 16 + Nginx  
**Objetivo:** Desplegar una instancia EC2 en AWS accesible mediante IP pública con llave SSH (.pem) para demostración en vivo.

---

## 📑 ÍNDICE DE CONTENIDO

1. [Fase 1: Lanzar Instancia EC2 y Generar Llave SSH (.pem)](#1-fase-1-lanzar-instancia-ec2-y-generar-llave-ssh-pem)
2. [Fase 2: Conexión SSH desde Windows (PowerShell)](#2-fase-2-conexión-ssh-desde-windows-powershell)
3. [Fase 3: Preparación del Servidor (Swap de RAM, PHP 8.4, PostgreSQL, Nginx y Node)](#3-fase-3-preparación-del-servidor-swap-de-ram-php-84-postgresql-nginx-y-node)
4. [Fase 4: Clonación del Proyecto y Configuración del Backend](#4-fase-4-clonación-del-proyecto-y-configuración-del-backend)
5. [Fase 5: Configuración de Nginx para Acceso Web](#5-fase-5-configuración-de-nginx-para-acceso-web)
6. [Fase 6: Verificación y Credenciales de Acceso](#6-fase-6-verificación-y-credenciales-de-acceso)
7. [Runbook de Mantenimiento y Actualizaciones](#7-runbook-de-mantenimiento-y-actualizaciones)

---

## 1. Fase 1: Lanzar Instancia EC2 y Generar Llave SSH (.pem)

1. Ingresa a la consola de AWS: [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
2. Dirígete a la región más cercana (ej: `us-east-1` N. Virginia o `us-east-2` Ohio) y abre **EC2**.
3. Haz clic en el botón naranja **Launch instance** (Lanzar instancia).
4. Configura los parámetros básicos:
   * **Name and tags:** `crm-unexo-demo`
   * **Application and OS Images (Amazon Machine Image):** Selecciona **Ubuntu** ➔ `Ubuntu Server 24.04 LTS (HVM), SSD Volume Type` (Free tier eligible).
   * **Instance type:** `t2.micro` (Capa gratuita de 1 vCPU y 1 GB RAM) o `t3.small` (2 GB RAM, si tienes créditos).
5. **Key pair (login) - Par de claves:**
   * Haz clic en **Create new key pair** (Crear nuevo par de claves).
   * **Key pair name:** `crm-key`
   * **Key pair type:** `RSA`
   * **Private key file format:** `.pem` (para OpenSSH / terminal de Windows).
   * Haz clic en **Create key pair** ➔ El archivo `crm-key.pem` se descargará a tu computadora.
6. **Network settings (Grupo de Seguridad / Firewall):**
   * Selecciona **Create security group**.
   * Activa las siguientes 3 casillas de reglas de entrada (*Inbound Rules*):
     * ✅ **Allow SSH traffic from:** `Anywhere` (`0.0.0.0/0`) — Puerto 22.
     * ✅ **Allow HTTP traffic from the internet** — Puerto 80.
     * ✅ **Allow HTTPS traffic from the internet** — Puerto 443.
7. **Configure storage (Disco):**
   * Tamaño: Cambia de 8 GiB a `25 GiB` o `30 GiB` tipo `gp3` (la capa gratuita permite hasta 30 GiB).
8. Haz clic en **Launch instance**.
9. Una vez la instancia pase a estado `Running`, haz clic en ella y copia la **Dirección IPv4 pública** (ejemplo: `54.210.35.120`).

---

## 2. Fase 2: Conexión SSH desde Windows (PowerShell)

Abre una terminal de **PowerShell** en tu máquina local:

1. Ve a la carpeta donde se descargó tu archivo `.pem`:
   ```powershell
   cd ~/Downloads
   ```

2. *(Recomendado en Windows si arroja error de permisos "Permissions are too open")*:
   ```powershell
   icacls .\crm-key.pem /inheritance:r
   icacls .\crm-key.pem /grant:r "$($env:USERNAME):(R)"
   ```

3. Conéctate a la instancia EC2 vía SSH (sustituye `TU_IP_PUBLICA` por la IP copiada en el paso anterior):
   ```powershell
   ssh -i .\crm-key.pem ubuntu@TU_IP_PUBLICA
   ```
   > Cuando pregunte `Are you sure you want to continue connecting (yes/no/[fingerprint])?`, escribe `yes` y presiona Enter.

---

## 3. Fase 3: Preparación del Servidor (Swap de RAM, PHP 8.4, PostgreSQL, Nginx y Node)

> ⚠️ **IMPORTANTE:** Las instancias `t2.micro` tienen solo 1 GB de RAM física. Durante la ejecución de `composer install` o `npm run build`, la memoria se agota y el servidor se congela. Crear un archivo Swap de 2 GB es obligatorio para garantizar estabilidad.

Ejecuta uno por uno los siguientes bloques de comandos dentro del servidor Ubuntu:

### 3.1. Crear y activar 2 GB de memoria Swap
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3.2. Actualizar paquetes base
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip zip nginx software-properties-common
```

### 3.3. Instalar PHP 8.4 y extensiones oficiales
```bash
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.4-fpm php8.4-cli php8.4-pgsql php8.4-curl \
                    php8.4-mbstring php8.4-xml php8.4-bcmath php8.4-zip \
                    php8.4-intl php8.4-gd
```

### 3.4. Instalar Composer (Gestor de dependencias PHP)
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 3.5. Instalar Node.js 20 LTS (para compilar React con Vite)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3.6. Instalar y Levantar PostgreSQL (Dos Opciones)

#### 🐳 Opción A (Recomendada con Docker - 1 Solo Comando):
Instala Docker en Ubuntu:
```bash
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
```
Levanta la imagen de PostgreSQL 16 con el `docker-compose.yml` que ya está en el repositorio:
```bash
cd /var/www/crm
docker compose up -d
```
*(Esto descarga la imagen oficial de PostgreSQL 16, crea la base `crm_educativo`, el usuario `crm_admin` con clave `crm_123` y monta el volumen persistente automáticamente).*

---

#### 🐘 Opción B (PostgreSQL Nativo sin Docker):
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql -c "CREATE USER crm_admin WITH PASSWORD 'crm_123' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE crm_educativo OWNER crm_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crm_educativo TO crm_admin;"
```

---

## 4. Fase 4: Clonación del Proyecto y Configuración del Backend

### 4.1. Clonar el repositorio oficial
```bash
sudo git clone https://github.com/Jael-S/crm.git /var/www/crm
cd /var/www/crm
sudo git checkout nicol
```

### 4.2. Asignar propiedad de la carpeta al usuario ubuntu
```bash
sudo chown -R ubuntu:ubuntu /var/www/crm
```

### 4.3. Configurar el archivo de entorno `.env`
```bash
cp .env.example .env
nano .env
```
Edita los siguientes valores clave (usa las flechas del teclado para moverte):
```ini
APP_NAME="CRM EDUCATIVO"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://TU_IP_PUBLICA

APP_TIMEZONE=America/La_Paz
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_ES

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=crm_educativo
DB_USERNAME=crm_admin
DB_PASSWORD=crm_123

SESSION_DRIVER=file
SESSION_LIFETIME=120
CACHE_STORE=file
QUEUE_CONNECTION=sync

# Correo Oficial Brevo SMTP (Recuperación de Contraseñas y Alertas)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=c560a3001@smtp-brevo.com
MAIL_PASSWORD=tu_password_smtp_brevo_aqui
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="33natymaxi@gmail.com"
MAIL_FROM_NAME="UNEXO"

VITE_APP_NAME="CRM EDUCATIVO"

# Integración con el Proyecto 2 (Grupo 6 SC)
CATALOG_API_URL=https://proyecto-l1e0.onrender.com/api/v1/catalogo
ENROLLMENT_API_URL=https://proyecto-l1e0.onrender.com/api/v1/matriculas
```
*(Para guardar en `nano`: presiona `Ctrl + O`, luego `Enter`, y para salir `Ctrl + X`).*

### 4.4. Instalar dependencias y compilar Frontend
```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
npm install
npm run build
```

### 4.5. Ejecutar migraciones y semillero de datos
```bash
php artisan migrate --force
php artisan db:seed --force
php artisan storage:link
```

### 4.6. Asignar permisos al servidor web Nginx
```bash
sudo chown -R www-data:www-data /var/www/crm/storage /var/www/crm/bootstrap/cache
sudo chmod -R 775 /var/www/crm/storage /var/www/crm/bootstrap/cache
```

---

## 5. Fase 5: Configuración de Nginx para Acceso Web

### 5.1. Crear archivo de Virtual Host
```bash
sudo nano /etc/nginx/sites-available/crm
```

Pega la siguiente configuración (recuerda cambiar `TU_IP_PUBLICA` por la IP de tu EC2):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name TU_IP_PUBLICA;
    root /var/www/crm/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;

    charset utf-8;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
*(Guarda con `Ctrl + O`, `Enter` y sal con `Ctrl + X`).*

### 5.2. Activar el sitio y reiniciar servicios
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx php8.4-fpm
```

---

## 6. Fase 6: Verificación y Credenciales de Acceso

Abre cualquier navegador web (Chrome, Edge, Firefox) e ingresa:
```text
http://TU_IP_PUBLICA
```

### 🔑 Cuentas para Demostración / Defensa:

| Rol | Correo Electrónico | Contraseña | Alcance Comercial |
|:---|:---|:---|:---|
| **Administrador** | `admin@crm.bo` | `password123` | Control total, reasignaciones, catálogo, CRUD motivos, reportes |
| **Coordinadora** | `sandovaljael08@gmail.com` | `password123` | Filtros por programa/versión, reportes analíticos |
| **Vendedora FICCT** | `nvmartinezm126@ficct.uagrm.edu.bo` | `password123` | Pipeline propio, toma de leads de Bolsa Común |
| **Vendedora UPB** | `vanessamartinez1@upb.edu` | `password123` | Pipeline propio, comprobantes de pago |

---

## 7. Runbook de Mantenimiento y Actualizaciones

### ¿Cómo actualizar el servidor si se suben cambios a GitHub?
Conéctate por SSH y ejecuta:
```bash
cd /var/www/crm
git pull origin nicol
php artisan migrate --force
npm run build
php artisan optimize:clear
```

### Monitoreo de logs en tiempo real (en caso de error):
* **Logs de Laravel:**
  ```bash
  tail -f /var/www/crm/storage/logs/laravel.log
  ```
* **Logs de Nginx:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```

### Reiniciar servicios rápidamente:
```bash
sudo systemctl restart php8.4-fpm nginx postgresql
```
