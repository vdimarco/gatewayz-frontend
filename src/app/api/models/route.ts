import { NextRequest, NextResponse } from 'next/server';
import { models } from '@/lib/models-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.gatewayz.ai';

// Transform static models data to backend format
function transformModel(model: any, gateway: string) {
  return {
    id: `${model.developer}/${model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: model.name,
    description: model.description,
    context_length: model.context * 1000, // Convert K to actual number
    pricing: {
      prompt: model.inputCost.toString(),
      completion: model.outputCost.toString()
    },
    architecture: {
      input_modalities: model.modalities.map((m: string) => m.toLowerCase())
    },
    supported_parameters: model.supportedParameters,
    provider_slug: model.developer
  };
}

// GET /api/models - Get models from specified gateway
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const gateway = searchParams.get('gateway');

    if (!gateway) {
      return NextResponse.json(
        { error: 'Gateway parameter required' },
        { status: 400 }
      );
    }

    // Validate gateway
    const validGateways = ['openrouter', 'portkey', 'featherless'];
    if (!validGateways.includes(gateway)) {
      return NextResponse.json(
        { error: 'Invalid gateway' },
        { status: 400 }
      );
    }

    console.log(`Models API - Attempting backend: ${API_BASE_URL}/models?gateway=${gateway}`);

    // Try backend first
    try {
      const url = `${API_BASE_URL}/models?gateway=${gateway}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Models API - Backend success: ${data.data?.length || 0} models`);
        return NextResponse.json(data);
      }

      console.log(`Models API - Backend returned ${response.status}, using fallback`);
    } catch (backendError) {
      console.log(`Models API - Backend error:`, backendError);
      console.log(`Models API - Using static fallback data`);
    }

    // Fallback to static data
    // Distribute models across gateways for testing
    const modelsPerGateway = Math.ceil(models.length / 3);
    let gatewayModels;

    if (gateway === 'openrouter') {
      gatewayModels = models.slice(0, modelsPerGateway);
    } else if (gateway === 'portkey') {
      gatewayModels = models.slice(modelsPerGateway, modelsPerGateway * 2);
    } else {
      gatewayModels = models.slice(modelsPerGateway * 2);
    }

    const transformedModels = gatewayModels.map(m => transformModel(m, gateway));

    return NextResponse.json({
      data: transformedModels
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
