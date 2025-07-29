// src/app/api/initialize-user-personas/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Admin client for server-side
import { personas as defaultPersonaTemplates } from '@/config/personas'; // Your default persona definitions

export async function POST(request: Request) {
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const personasToInsert = defaultPersonaTemplates.map(template => ({
      user_id: userId,
      template_id: template.id, // Use the string ID from your config
      is_customized: false, // Initially, it's not customized
      name: template.name,
      description: template.description,
      characteristics: template.characteristics,
      boundaries: template.boundaries,
      system_prompt: template.system_prompt,
      model_config: template.modelConfig,
      avatar: template.avatar,
      color: template.color,
    }));

    const { error } = await supabaseAdmin.from('personas').insert(personasToInsert);

    if (error) {
      console.error(`Error initializing personas for user ${userId}:`, error);
      return NextResponse.json({ error: 'Failed to initialize personas' }, { status: 500 });
    }

    console.log(`Successfully initialized 10 default personas for user ${userId}.`);
    return NextResponse.json({ message: 'Personas initialized successfully' }, { status: 200 });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}