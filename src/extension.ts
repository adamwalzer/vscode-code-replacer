// The module 'vscode' contains the VS Code extensibility API
// Import the necessary extensibility types to use in your code below
import {
    window,
    workspace,
    Disposable,
    ExtensionContext,
    StatusBarAlignment,
    StatusBarItem,
    Range,
    languages,
    DiagnosticCollection,
    DiagnosticSeverity,
    Diagnostic,
} from 'vscode';

const {
    configs,
    statusBarText,
    replaceOnSave,
} = workspace.getConfiguration('codeReplacer');

// This method is called when your extension is activated. Activation is
// controlled by the activation events defined in package.json.
export function activate(context: ExtensionContext) {
    // create a new code finder
    let codeFinder = new CodeFinder();
    let controller = new CodeFinderController(codeFinder);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(controller);
    context.subscriptions.push(codeFinder);
}

class CodeFinder {

    private _statusBarItem: StatusBarItem;

    private _diagnosticCollection: DiagnosticCollection;

    constructor() {
        this._diagnosticCollection = languages.createDiagnosticCollection();
        this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    }

    public findCode() {

        // Create as needed
        if (!this._statusBarItem) return;

        const editor = window.activeTextEditor;

        if (!editor || !configs.hasOwnProperty(editor.document.languageId)) {
            this._statusBarItem.hide();
            return;
        }

        const config = configs[editor.document.languageId];
        const regExps = Object.keys(config).map(key => (
            [ new RegExp(key), config[key] ]
        ));

        const diagnostics = editor.document.getText().split('\n').reduce((a, line, lineNum) => (
            regExps.reduce((b, regExp) => {
                const info = line.match(regExp[0]);

                if (!info) {
                    return b;
                }

                b.push(new Diagnostic(
                    new Range(lineNum, info.index, lineNum + 1, 0),
                    "Replace with " + regExp[1],
                    DiagnosticSeverity.Warning
                ));

                return b;
            }, a)
        ), []);

        if (editor === window.activeTextEditor) {
            this._diagnosticCollection.set(editor.document.uri, diagnostics);
            this._statusBarItem.text = eval(statusBarText);
            this._statusBarItem.show();
        }
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class CodeFinderController {

    private _codeFinder: CodeFinder;
    private _disposable: Disposable;

    constructor(codeFinder: CodeFinder) {
        this._codeFinder = codeFinder;

        // subscribe to selection change and editor activation events
        let subscriptions: Disposable[] = [];

        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        workspace.onDidChangeTextDocument(this._onEvent, this, subscriptions);
        workspace.onDidSaveTextDocument(this._onEvent, this, subscriptions);

        // update the error finder for the current file
        this._codeFinder.findCode();

        // create a combined disposable from both event subscriptions
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._codeFinder.findCode();
    }
}
