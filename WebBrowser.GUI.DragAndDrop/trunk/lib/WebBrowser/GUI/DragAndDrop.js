/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is WebBrowser.GUI.DragAndDrop module.
 *
 * The Initial Developer of the Original Code is
 * Daisuke Maki.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

//@esmodpp
//@version 0.0.0
//@namespace WebBrowser.GUI

//@export setDragAndDrop
function setDragAndDrop ( obj, hash ) {
    obj.onmousedown = function ( e ) {
        e = e || window.event;
        if ( typeof hash.start == "function" ) hash.start.call(obj, e);
        var onDown   = obj.onmousedown;
        var onSelect = document.onselectstart;
        var onMove   = document.onmousemove;
        var onUp     = document.onmouseup;
        obj.onmousedown = document.onselectstart = function ( ) {
            return false;
        };
        document.onmousemove = function ( e ) {
            e = e || window.event;
            if ( typeof hash.move == "function" ) hash.move.call(obj, e);
        };
        document.onmouseup = function ( e ) {
            e = e || window.event;
            if ( typeof hash.end == "function" ) hash.end.call(obj, e);
            obj.onmousedown   = onDown;
            document.onselectstart = onSelect;
            document.onmousemove   = onMove;
            document.onmouseup     = onUp;
        };
    }
}

