const TURBO_DA_BASE_URL = process.env.NEXT_PUBLIC_TURBO_DA_BASE_URL || 'https://staging.turbo-api.availproject.org';

export interface TurboDASubmissionResponse {
  submission_id: string;
}

export interface TurboDASubmissionInfo {
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

export interface TurboDAError {
  error: string;
}

/**
 * Submit raw data to Turbo DA via API route
 */
export async function submitRawData(data: string | Blob): Promise<TurboDASubmissionResponse> {
  try {
    const response = await fetch('/api/turbo-da', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: data instanceof Blob ? data : new Blob([data], { type: 'application/octet-stream' }),
    });

    if (response.status === 429) {
      const errorData = await response.json();
      const error = new Error(`Rate limit exceeded. Please try again in ${errorData.retryAfter || 60} seconds.`);
      (error as any).isRateLimit = true;
      (error as any).retryAfter = errorData.retryAfter;
      throw error;
    }

    if (!response.ok) {
      const errorData: TurboDAError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting data to Turbo DA:', error);
    throw error;
  }
}

/**
 * Retrieve pre-image data from Turbo DA
 */
export async function getPreImageData(submissionId: string): Promise<Blob> {
  try {
    const response = await fetch(
      `/api/turbo-da/pre-image?submission_id=${submissionId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorData: TurboDAError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error retrieving pre-image data from Turbo DA:', error);
    throw error;
  }
}

/**
 * Get submission information from Turbo DA via API route
 */
export async function getSubmissionInfo(submissionId: string): Promise<TurboDASubmissionInfo> {
  try {
    const response = await fetch(
      `/api/turbo-da?submission_id=${submissionId}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      const errorData: TurboDAError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving submission info from Turbo DA:', error);
    throw error;
  }
}

/**
 * Submit puzzle completion data to Turbo DA
 */
export async function submitPuzzleCompletion(
  puzzleSize: number,
  moves: number,
  timeMs: number,
  isComplete: boolean
): Promise<TurboDASubmissionResponse> {
  const puzzleData = {
    puzzleSize,
    moves,
    timeMs,
    isComplete,
    timestamp: new Date().toISOString(),
    gameType: 'avail-sliding-puzzle',
  };

  const dataString = JSON.stringify(puzzleData);
  return submitRawData(dataString);
}

/**
 * Get submission status for display in UI
 */
export function getSubmissionStatus(state: string): {
  status: 'pending' | 'processing' | 'finalized' | 'error';
  label: string;
  color: string;
} {
  switch (state.toLowerCase()) {
    case 'pending':
      return { status: 'pending', label: 'Pending', color: '#44D5DE' };
    case 'processing':
      return { status: 'processing', label: 'Processing', color: '#EDC7FC' };
    case 'finalized':
      return { status: 'finalized', label: 'Finalized', color: '#5FD39C' };
    default:
      return { status: 'error', label: 'Error', color: '#ff6b6b' };
  }
} 