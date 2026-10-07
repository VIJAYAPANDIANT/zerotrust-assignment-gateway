const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Handle HTTP response and JSON parsing
 */
async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An unexpected error occurred');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// -----------------------------------------------------------------------------
// Authentication Endpoints
// -----------------------------------------------------------------------------

export async function registerUser({ name, email, password, role }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(response);
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

export async function getMe(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function logoutUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResponse(response);
}

// -----------------------------------------------------------------------------
// Assignment Endpoints
// -----------------------------------------------------------------------------

export async function getAssignments(token) {
  const response = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getAssignmentById(token, id) {
  const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

// -----------------------------------------------------------------------------
// Submission Endpoints
// -----------------------------------------------------------------------------

export async function getMySubmissions(token) {
  const response = await fetch(`${API_BASE_URL}/submissions/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function submitAssignment(token, { assignmentId, file, fileUrl }) {
  const headers = { Authorization: `Bearer ${token}` };
  let body;

  if (file) {
    const formData = new FormData();
    formData.append('assignment_id', assignmentId);
    formData.append('file', file);
    body = formData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      assignment_id: assignmentId,
      file_url: fileUrl,
    });
  }

  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers,
    body,
  });

  return handleResponse(response);
}

/**
 * Request secure access metadata or signed URL for a submission file
 */
export async function getSubmissionFileMetadata(token, submissionId) {
  const response = await fetch(
    `${API_BASE_URL}/submissions/${submissionId}/file?format=json`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return handleResponse(response);
}

/**
 * Securely download or open an authorized submission artifact
 * Automatically checks whether to use a temporary signed URL or an authenticated stream
 */
export async function downloadSubmissionFile(token, submissionId, filename = 'assignment_solution') {
  try {
    const meta = await getSubmissionFileMetadata(token, submissionId);
    if (meta.download_url && (meta.download_url.startsWith('http://') || meta.download_url.startsWith('https://'))) {
      window.open(meta.download_url, '_blank', 'noopener,noreferrer');
      return;
    }
  } catch (err) {
    // If format=json not supported or failed, continue to direct stream
  }

  const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}/file`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Access denied or file not found.');
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.href = blobUrl;
  tempLink.download = filename;
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
}

// -----------------------------------------------------------------------------
// Faculty Specific Endpoints
// -----------------------------------------------------------------------------

export async function createAssignment(token, { title, description, deadline }) {
  const response = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, deadline }),
  });
  return handleResponse(response);
}

export async function getFacultyAssignments(token) {
  const response = await fetch(`${API_BASE_URL}/faculty/assignments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getFacultySubmissions(token) {
  const response = await fetch(`${API_BASE_URL}/faculty/submissions`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function getFacultySubmissionById(token, id) {
  const response = await fetch(`${API_BASE_URL}/faculty/submissions/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response);
}

export async function gradeSubmission(token, id, { marks, feedback }) {
  const response = await fetch(`${API_BASE_URL}/faculty/submissions/${id}/grade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ marks, feedback }),
  });
  return handleResponse(response);
}
