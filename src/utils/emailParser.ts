/**
 * Utility functions for parsing email content
 */

export function parseEmailContent(messageContent: string, direction: 'inbound' | 'outbound'): string {
  // For outbound messages, return as-is since they're already clean
  if (direction === 'outbound') {
    return messageContent;
  }

  // For inbound messages, we need to parse the email content
  try {
    // Check if this looks like raw email content (has headers)
    if (messageContent.includes('Content-Type:') || messageContent.includes('Content-Transfer-Encoding:')) {
      return parseRawEmailContent(messageContent);
    }
    
    // If it's already clean content, return as-is
    return messageContent;
  } catch (error) {
    console.error('Error parsing email content:', error);
    return messageContent; // Fallback to original content
  }
}

function parseRawEmailContent(rawContent: string): string {
  // Split the content into lines
  const lines = rawContent.split('\n');
  
  let isInHeaders = true;
  let contentType = '';
  let encoding = '';
  let bodyLines: string[] = [];
  let foundEmptyLine = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (isInHeaders) {
      // Check for content type
      if (line.startsWith('Content-Type:')) {
        contentType = line.toLowerCase();
      }
      
      // Check for encoding
      if (line.startsWith('Content-Transfer-Encoding:')) {
        encoding = line.split(':')[1]?.trim().toLowerCase() || '';
      }
      
      // Empty line indicates end of headers
      if (line === '') {
        isInHeaders = false;
        foundEmptyLine = true;
        continue;
      }
    } else {
      // We're in the body now
      bodyLines.push(lines[i]);
    }
  }
  
  // If we never found an empty line, treat everything after the encoding header as body
  if (!foundEmptyLine && encoding) {
    bodyLines = [];
    let foundEncodingHeader = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Content-Transfer-Encoding:')) {
        foundEncodingHeader = true;
        continue;
      }
      if (foundEncodingHeader) {
        bodyLines.push(lines[i]);
      }
    }
  }
  
  let bodyContent = bodyLines.join('\n').trim();
  
  // Handle base64 encoding
  if (encoding === 'base64') {
    try {
      // Remove any whitespace and newlines from base64 content
      const cleanBase64 = bodyContent.replace(/\s/g, '');
      bodyContent = atob(cleanBase64);
    } catch (error) {
      console.error('Error decoding base64:', error);
      // If base64 decoding fails, return the original content
    }
  }
  
  // Handle quoted-printable encoding
  if (encoding === 'quoted-printable') {
    bodyContent = decodeQuotedPrintable(bodyContent);
  }
  
  // Clean up the content
  bodyContent = cleanEmailContent(bodyContent);
  
  return bodyContent;
}

function decodeQuotedPrintable(input: string): string {
  return input
    .replace(/=\r?\n/g, '') // Remove soft line breaks
    .replace(/=([0-9A-F]{2})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
}

function cleanEmailContent(content: string): string {
  // Remove excessive quoted content (lines starting with >)
  const lines = content.split('\n');
  const cleanLines: string[] = [];
  let quotedSectionStarted = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // If we hit a line that starts with '>', we're in quoted content
    if (trimmedLine.startsWith('>')) {
      if (!quotedSectionStarted) {
        cleanLines.push(''); // Add a line break before quoted content
        cleanLines.push('[Previous conversation quoted below]');
        quotedSectionStarted = true;
      }
      break; // Stop processing once we hit quoted content
    }
    
    // Skip signature separators
    if (trimmedLine === '--' || trimmedLine.startsWith('--')) {
      break;
    }
    
    cleanLines.push(line);
  }
  
  return cleanLines.join('\n').trim();
}

export function extractSubject(messageContent: string): string | null {
  const lines = messageContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('Subject:')) {
      return line.substring(8).trim();
    }
  }
  
  return null;
}