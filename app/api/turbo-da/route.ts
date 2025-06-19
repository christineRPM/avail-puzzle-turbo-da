import { NextRequest, NextResponse } from 'next/server';

const TURBO_DA_BASE_URL = process.env.TURBO_DA_BASE_URL || 'https://staging.turbo-api.availproject.org';
const TURBODA_API_KEY = process.env.TURBODA_API_KEY;

interface TurboDASubmissionResponse {
  submission_id: string;
}

interface TurboDASubmissionInfo {
  data: {
    amount_data: string;
    block_hash: string;
    block_number: number;
    created_at: string;
    data_billed: string;
    data_hash: string;
    fees: string;
    tx_hash: string;
    tx_index: number;
    user_id: string;
  };
  error: string | null;
  id: string;
  state: string;
}

interface TurboDAError {
  error: string;
}

// POST /api/turbo-da/submit
export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] POST /api/turbo-da - Starting data submission`);
  
  if (!TURBODA_API_KEY) {
    console.error(`[${requestId}] Error: TURBODA_API_KEY is not configured`);
    return NextResponse.json(
      { error: 'TURBODA_API_KEY is not configured' },
      { status: 500 }
    );
  }

  if (!TURBO_DA_BASE_URL) {
    console.error(`[${requestId}] Error: TURBO_DA_BASE_URL is not configured`);
    return NextResponse.json(
      { error: 'TURBO_DA_BASE_URL is not configured' },
      { status: 500 }
    );
  }

  console.log(`[${requestId}] Config: TURBO_DA_BASE_URL=${TURBO_DA_BASE_URL}`);
  console.log(`[${requestId}] Config: API Key present=${!!TURBODA_API_KEY}`);

  try {
    const body = await request.text();
    console.log(`[${requestId}] Request body length: ${body.length} characters`);
    console.log(`[${requestId}] Request body preview: ${body.substring(0, 200)}...`);
    
    const turboDAUrl = `${TURBO_DA_BASE_URL}/v1/submit_raw_data`;
    console.log(`[${requestId}] Making request to: ${turboDAUrl}`);
    
    const response = await fetch(turboDAUrl, {
      method: 'POST',
      headers: {
        'x-api-key': TURBODA_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: body,
    });

    console.log(`[${requestId}] Turbo DA response status: ${response.status}`);
    console.log(`[${requestId}] Turbo DA response headers:`, Object.fromEntries(response.headers.entries()));

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || 'unknown';
      console.log(`[${requestId}] Rate limit hit. Retry after: ${retryAfter} seconds`);
      return NextResponse.json(
        { 
          error: 'rate_limit',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter: parseInt(retryAfter) || 60
        },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData: TurboDAError = await response.json();
      console.error(`[${requestId}] Turbo DA error:`, errorData);
      return NextResponse.json(
        { error: errorData.error || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data: TurboDASubmissionResponse = await response.json();
    console.log(`[${requestId}] Success! Submission ID: ${data.submission_id}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[${requestId}] Error submitting data to Turbo DA:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/turbo-da/submission-info
export async function GET(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[${requestId}] GET /api/turbo-da - Starting submission info request`);
  
  if (!TURBODA_API_KEY) {
    console.error(`[${requestId}] Error: TURBODA_API_KEY is not configured`);
    return NextResponse.json(
      { error: 'TURBODA_API_KEY is not configured' },
      { status: 500 }
    );
  }

  if (!TURBO_DA_BASE_URL) {
    console.error(`[${requestId}] Error: TURBO_DA_BASE_URL is not configured`);
    return NextResponse.json(
      { error: 'TURBO_DA_BASE_URL is not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('submission_id');

  console.log(`[${requestId}] Requested submission ID: ${submissionId}`);

  if (!submissionId) {
    console.error(`[${requestId}] Error: submission_id is required`);
    return NextResponse.json(
      { error: 'submission_id is required' },
      { status: 400 }
    );
  }

  try {
    const turboDAUrl = `${TURBO_DA_BASE_URL}/v1/get_submission_info?submission_id=${submissionId}`;
    console.log(`[${requestId}] Making request to: ${turboDAUrl}`);
    
    const response = await fetch(turboDAUrl, {
      method: 'GET',
      headers: {
        'x-api-key': TURBODA_API_KEY,
      },
    });

    console.log(`[${requestId}] Turbo DA response status: ${response.status}`);
    console.log(`[${requestId}] Turbo DA response headers:`, Object.fromEntries(response.headers.entries()));

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after') || 'unknown';
      console.log(`[${requestId}] Rate limit hit. Retry after: ${retryAfter} seconds`);
      return NextResponse.json(
        { 
          error: 'rate_limit',
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          retryAfter: parseInt(retryAfter) || 60
        },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorData: TurboDAError = await response.json();
      console.error(`[${requestId}] Turbo DA error:`, errorData);
      return NextResponse.json(
        { error: errorData.error || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data: TurboDASubmissionInfo = await response.json();
    console.log(`[${requestId}] Success! Submission state: ${data.state}`);
    console.log(`[${requestId}] Submission details:`, {
      id: data.id,
      state: data.state,
      blockNumber: data.data?.block_number,
      txHash: data.data?.tx_hash,
      createdAt: data.data?.created_at
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[${requestId}] Error retrieving submission info from Turbo DA:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 