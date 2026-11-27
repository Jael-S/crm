<?php

namespace App\Mail;

use App\Models\Usuario;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Usuario $usuario,
        public string $resetUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Restablecer Contraseña · UNEXO CRM',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
