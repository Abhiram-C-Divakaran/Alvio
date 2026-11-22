import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/languages/definitions/javascript/register';
import 'monaco-editor/languages/definitions/python/register';
import 'monaco-editor/languages/definitions/cpp/register';
import 'monaco-editor/languages/definitions/java/register';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';

(self as unknown as { MonacoEnvironment?: { getWorker: () => Worker } }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });
