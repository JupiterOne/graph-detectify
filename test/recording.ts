import {
  setupRecording,
  Recording,
  SetupRecordingInput,
  mutations,
  RecordingEntry,
} from '@jupiterone/integration-sdk-testing';

export { Recording };

export function setupProjectRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    ...input,
    redactedRequestHeaders: ['X-Detectify-Key'],
    mutateEntry: mutateRecordingEntry,
  });
}
function mutateRecordingEntry(entry: RecordingEntry): void {
  mutations.unzipGzippedRecordingEntry(entry);
}
