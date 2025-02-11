import { NextResponse } from "next/server";
import { Twilio } from "twilio";

function formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if number already has country code
    if (cleaned.startsWith('549')) {
        return cleaned;
    }
    
    // Add country code if missing
    return `549${cleaned}`;
}

export async function POST(req: Request) {
    try {
        const { phoneNumber } = await req.json();

        if (!phoneNumber) {
            return NextResponse.json({ 
                error: "Falta el número de teléfono" 
            }, { status: 400 });
        }

        // Format and validate phone number
        const formattedNumber = formatPhoneNumber(phoneNumber);
        if (formattedNumber.length < 12) { // 549 + 9 digits
            return NextResponse.json({ 
                error: "Número de teléfono inválido" 
            }, { status: 400 });
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";
        
        if (!accountSid || !authToken) {
            console.error("Missing Twilio credentials");
            return NextResponse.json({ 
                error: "Error de configuración del servidor" 
            }, { status: 500 });
        }

        const client = new Twilio(accountSid, authToken);
        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const message = await client.messages.create({
            body: `Tu código de verificación para Cargatusfichas.com es: ${verificationCode}`,
            from: twilioNumber,
            to: `whatsapp:+${formattedNumber}`
        });

        console.log("Twilio message sent successfully:", {
            sid: message.sid,
            status: message.status,
            to: message.to
        });

        return NextResponse.json({ 
            success: true, 
            sid: message.sid,
            verificationCode,
            formattedNumber
        }, { status: 200 });
    } catch (error: any) {
        console.error("Twilio error:", error);
        return NextResponse.json({ 
            error: "Error al enviar el mensaje de verificación" 
        }, { status: 500 });
    }
}