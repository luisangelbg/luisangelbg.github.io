The applications of the suite are launching two shared pieces. One changes the way you move around inside each app; the other, the way you prepare figures for publication. Both work offline, in the browser and with nothing to install, just like the rest of the suite.

## The navigator: blocks, sections and a search

The blocks of each app now live in a **sidebar on the left**. There you can see at a glance:

- which block you are in (in gold);
- which ones you have finished (with a tick);
- which ones are waiting on an earlier step (with a padlock).

With the `[` key the bar shrinks to its numbers to leave more room. On a phone it turns into a row of tabs at the bottom.

Inside each block there are two ways to read:

- **Document.** Every section, one after another. On the right, a contents list follows your reading and a thin bar marks how far you have come.
- **Focused.** One section at a time, with *Previous* and *Next*, or with Alt + ← and Alt + →. It is useful in class or when a block has many parts.

And a search that finds everything. With **Ctrl + K** you can type the name of a block, of a section, of a control ("confidence level", "palette") or of an action ("dark theme", "copy the link"), and get there with Enter. Accents and typing slips do not matter.

Also:

- **Links to a section.** The browser address changes as you move (`#b3/explained-variance`), so you can send a link to an exact part of an app. Back and Forward work as on any page.
- **Go to the pending step.** When a block needs something from an earlier step (loading data, running an analysis), a button takes you straight to that step.
- **Return to the last thing you edited**, collapse sections you do not need and, with `?`, a help panel that tells you where you are.

## The figure studio: edit on a split screen

Every figure now has a small button with a pencil and a ruler. When you press it, the figure opens on a **split screen**:

- on the left, the figure always in view, on a "sheet" the size at which you are going to publish it;
- on the right, all its options, in order and with a search box.

What you change is shown at once.

In the studio you can:

- **Adjust the figure** with the options of each app, now together and in view while you edit.
- **Try scientific palettes** and see how someone with colour blindness will see it. The simulation only changes the view; it is not exported.
- **Prepare the figure for the journal.** The studio tells you how large the smallest text is *at the output size* and warns you if it falls below 6 points, which is what many journals ask for. A preset fixes it with one click.
- **Compare before and after** with a curtain that slides over the figure.
- **Undo** any step (Ctrl + Z) and return to any point in the history.
- **Export** in PNG, SVG, PDF or TIFF, in millimetres or inches, at 300, 600 or 1200 dpi and with a transparent background if you need it.

The one-click presets cover the most common cases:

- paper at one, one and a half or two columns;
- line drawing;
- presentation;
- poster;
- web;
- greyscale printing.

You can also save your own and share them in a file.

## For those who code

Both pieces are **shared, versioned modules** (1.0.0) that any app of the suite loads with a single line. Their source code, the integration guides, the tests and the map of how the apps are built are in the [`shared/`](https://github.com/luisangelbg/luisangelbg.github.io/tree/main/shared) folder of the site repository. The icons are thin-line and carry a free licence compatible with the GPL-3.0. Their licence is declared in `LICENSES-TERCEROS.md`.
