declare namespace AceAjax {
    interface Options {
        // Editor
        selectionStyle?: "line" | "text";
        highlightActiveLine?: boolean;
        highlightSelectedWord?: boolean;
        readOnly?: boolean;
        cursorStyle?: "ace" | "slim" | "smooth" | "wide";
        mergeUndoDeltas?: boolean | "always";
        behavioursEnabled?: boolean;
        wrapBehavioursEnabled?: boolean;
        /**this is needed if editor is inside scrollable page
         * default: false */
        autoScrollEditorIntoView?: boolean;
        /**copy/cut the full line if selection is empty, defaults to false */
        copyWithEmptySelection?: boolean;
        /**default: false */
        navigateWithinSoftTabs?: boolean;
        /**default: true */
        enableMultiselect?: boolean;

        // Renderer
        hScrollBarAlwaysVisible?: boolean;
        vScrollBarAlwaysVisible?: boolean;
        highlightGutterLine?: boolean;
        animatedScroll?: boolean;
        showInvisibles?: boolean;
        showPrintMargin?: boolean;
        /**default: 80 */
        printMarginColumn?: number;
        // shortcut for showPrintMargin and printMarginColumn
        printMargin?: false | number;
        fadeFoldWidgets?: boolean;
        /**default: true */
        showFoldWidgets?: boolean;
        /**default: true */
        showLineNumbers?: boolean;
        /**default: true */
        showGutter?: boolean;
        /**default: true */
        displayIndentGuides?: boolean;
        fontSize?: number | string;
        fontFamily?: string;
        // resize editor based on the contents of the editor until the number of lines reaches maxLines
        maxLines?: number;
        minLines?: number;
        // number of page sizes to scroll after document end (typical values are 0, 0.5, and 1)
        scrollPastEnd?: number | boolean;
        /**default: false */
        fixedWidthGutter?: boolean;
        theme?: string;

        // MouseHandler

        scrollSpeed: number;
        dragDelay: number;
        dragEnabled: boolean;
        focusTimout: number;
        tooltipFollowsMouse: boolean;

        // Session
        firstLineNumber: number;
        overwrite: boolean;
        newLineMode: "auto" | "unix" | "windows";
        useWorker: boolean;
        /**default: false */
        useSoftTabs?: boolean;
        tabSize: number;
        wrap: boolean | number;
        foldStyle: "markbegin" | "markbeginend" | "manual";
        mode: string;
    }
}
