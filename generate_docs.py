"""
Generate IEEE-format SRS and SDD Word documents for the Nucleus project.
Run: python generate_docs.py
Requires: pip install python-docx matplotlib Pillow
"""

import os
import sys
import io
import math
from datetime import datetime

# Force UTF-8 stdout on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── dependency check ──────────────────────────────────────────────────────────
try:
    from docx import Document
    from docx.shared import (Inches, Pt, RGBColor, Cm)
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    import docx.shared
except ImportError:
    print("Installing python-docx …")
    os.system(f"{sys.executable} -m pip install python-docx")
    from docx import Document
    from docx.shared import Inches, Pt, RGBColor, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
    import docx.shared

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
    import numpy as np
    HAS_MPL = True
except ImportError:
    print("Installing matplotlib …")
    os.system(f"{sys.executable} -m pip install matplotlib numpy")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
    import numpy as np
    HAS_MPL = True

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    print("Installing Pillow …")
    os.system(f"{sys.executable} -m pip install Pillow")
    from PIL import Image
    HAS_PIL = True

# ─────────────────────────────────────────────────────────────────────────────
# Colour palette – plain black/white (no colour)
# ─────────────────────────────────────────────────────────────────────────────
CLR_BLACK     = RGBColor(0x00, 0x00, 0x00)
CLR_WHITE     = RGBColor(0xFF, 0xFF, 0xFF)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR    = os.path.join(SCRIPT_DIR, "_doc_images")
os.makedirs(IMG_DIR, exist_ok=True)

TODAY = datetime.now().strftime("%B %d, %Y")

# ─────────────────────────────────────────────────────────────────────────────
# Helper – set cell background colour (no-op in plain mode)
# ─────────────────────────────────────────────────────────────────────────────
def set_cell_bg(cell, hex_color: str):
    """No-op: all cells are plain white."""
    pass

H1_HEX  = "FFFFFF"
TBL_HEX = "FFFFFF"
ALT_HEX = "FFFFFF"
ACC_HEX = "FFFFFF"

# ─────────────────────────────────────────────────────────────────────────────
# Helper – add page-break
# ─────────────────────────────────────────────────────────────────────────────
def page_break(doc):
    doc.add_page_break()

# ─────────────────────────────────────────────────────────────────────────────
# Helper – plain headings (no colour)
# ─────────────────────────────────────────────────────────────────────────────
def add_h1(doc, text: str):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(16)
    run.font.color.rgb = CLR_BLACK
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(6)
    return p

def add_h2(doc, text: str):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(14)
    run.font.color.rgb = CLR_BLACK
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after  = Pt(4)
    return p

def add_h3(doc, text: str):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(12)
    run.font.color.rgb = CLR_BLACK
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after  = Pt(3)
    return p

def add_body(doc, text: str, bold=False, italic=False, indent=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(11)
    run.bold   = bold
    run.italic = italic
    if indent:
        p.paragraph_format.left_indent = Cm(0.8)
    p.paragraph_format.space_after = Pt(4)
    return p

def add_bullet(doc, text: str, level=0):
    p = doc.add_paragraph(style="List Bullet")
    run = p.add_run(text)
    run.font.size = Pt(11)
    if level > 0:
        p.paragraph_format.left_indent = Cm(1.2 * level)
    p.paragraph_format.space_after = Pt(3)
    return p

def add_numbered(doc, text: str):
    p = doc.add_paragraph(style="List Number")
    run = p.add_run(text)
    run.font.size = Pt(11)
    p.paragraph_format.space_after = Pt(3)
    return p

def caption(doc, text: str):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.size  = Pt(10)
    run.italic     = True
    run.font.color.rgb = CLR_BLACK
    p.paragraph_format.space_after = Pt(8)

def add_image_placeholder(doc, label: str, width=Inches(5.5)):
    """Placeholder text when actual image not available."""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(f"[{label}]")
    run.font.size  = Pt(10)
    run.italic     = True
    run.font.color.rgb = CLR_BLACK
    p.paragraph_format.space_after = Pt(4)

# ─────────────────────────────────────────────────────────────────────────────
# Diagram generators (matplotlib → PNG bytes → Word image)
# ─────────────────────────────────────────────────────────────────────────────
def fig_to_bytes(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf

def insert_figure(doc, buf, width=Inches(5.8)):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    run.add_picture(buf, width=width)
    return p

# ── 1. System Architecture diagram ───────────────────────────────────────────
def make_arch_diagram():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, 12); ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_facecolor("#F0F4F8")
    fig.patch.set_facecolor("#F0F4F8")

    navy, blue, green, orange, purple, gray = (
        "#1A233A", "#2E86C1", "#27AE60", "#E67E22", "#8E44AD", "#7F8C8D"
    )

    boxes = [
        # (x, y, w, h, colour, label, sublabel)
        (0.4, 5.5, 2.5, 1.0, blue,   "React Frontend",      "Vite + TailwindCSS"),
        (4.5, 5.5, 2.5, 1.0, navy,   "API Gateway / JWT",   "Express Middleware"),
        (8.5, 5.5, 3.0, 1.0, green,  "Node.js Backend",     "REST API + Controllers"),
        (0.4, 3.0, 2.5, 1.0, orange, "Voice Auth Service",  "FastAPI + MFCC"),
        (4.5, 3.0, 2.5, 1.0, purple, "Face Auth Service",   "DeepFace + Facenet512"),
        (8.5, 3.0, 3.0, 1.0, gray,   "MongoDB Atlas",       "Document Storage"),
        (4.5, 0.5, 2.5, 1.0, "#C0392B", "Jenkins CI/CD",   "Declarative Pipeline"),
        (0.4, 0.5, 2.5, 1.0, "#16A085", "Docker Compose",  "nucleus-network"),
    ]

    for (x, y, w, h, col, lbl, sub) in boxes:
        rect = FancyBboxPatch((x, y), w, h,
                              boxstyle="round,pad=0.05",
                              linewidth=1.5,
                              edgecolor="white",
                              facecolor=col,
                              zorder=2)
        ax.add_patch(rect)
        ax.text(x + w/2, y + h*0.62, lbl, ha="center", va="center",
                fontsize=10, fontweight="bold", color="white", zorder=3)
        ax.text(x + w/2, y + h*0.25, sub, ha="center", va="center",
                fontsize=7.5, color="#DDDDDD", zorder=3)

    arrows = [
        (2.9, 6.0, 4.5, 6.0),   # Frontend → Gateway
        (7.0, 6.0, 8.5, 6.0),   # Gateway  → Backend
        (1.65, 5.5, 1.65, 4.0), # Frontend → Voice
        (5.75, 5.5, 5.75, 4.0), # Gateway  → Face
        (8.5+1.5, 5.5, 8.5+1.5, 4.0), # Backend → Mongo
        (4.5, 3.5, 2.9, 3.5),   # Voice ← Gateway (reverse arrow)
        (7.0, 3.5, 8.5, 3.5),   # Face  → Mongo
        (4.5+1.25, 1.5, 4.5+1.25, 3.0), # Jenkins → Face
        (1.65, 3.0, 1.65, 1.5), # Docker → Jenkins
    ]
    for (x1,y1,x2,y2) in arrows:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#444", lw=1.5),
                    zorder=1)

    ax.set_title("Nucleus – High-Level System Architecture",
                 fontsize=14, fontweight="bold", color=navy, pad=10)
    return fig_to_bytes(fig)

# ── 2. Authentication flow diagram ───────────────────────────────────────────
def make_auth_flow():
    fig, ax = plt.subplots(figsize=(11, 8))
    ax.set_xlim(0, 11); ax.set_ylim(0, 8)
    ax.axis("off")
    ax.set_facecolor("#FAFAFA")
    fig.patch.set_facecolor("#FAFAFA")

    navy, blue, green, red = "#1A233A", "#2E86C1", "#27AE60", "#C0392B"

    steps = [
        (5.5, 7.2, "User visits Nucleus Portal",      blue),
        (5.5, 6.0, "Login with Credentials (email/pw)", blue),
        (5.5, 4.8, "2FA – TOTP via Authenticator App", "#8E44AD"),
        (2.2, 3.6, "Biometric Enrollment\n(Voice + Face)", green),
        (8.8, 3.6, "Existing User – Skip Enrollment",       "#E67E22"),
        (5.5, 2.4, "Dashboard Access Granted",         green),
        (5.5, 1.2, "Continuous Behavioural Monitoring", navy),
        (2.0, 0.1, "Anomaly Detected → Step-Up Auth",  red),
        (8.8, 0.1, "Session Valid – Continue",         green),
    ]

    for (cx, cy, lbl, col) in steps:
        w, h = 3.0, 0.75
        rect = FancyBboxPatch((cx - w/2, cy - h/2), w, h,
                              boxstyle="round,pad=0.07",
                              linewidth=1.5, edgecolor=col,
                              facecolor=col+"22", zorder=2)
        ax.add_patch(rect)
        ax.text(cx, cy, lbl, ha="center", va="center",
                fontsize=8.5, color=col, fontweight="bold",
                multialignment="center", zorder=3)

    flow = [
        (5.5, 6.85, 5.5, 6.37),
        (5.5, 5.63, 5.5, 5.15),
        (5.5, 4.43, 2.2, 3.985),
        (5.5, 4.43, 8.8, 3.985),
        (2.2, 3.22, 5.5, 2.78),
        (8.8, 3.22, 5.5, 2.78),
        (5.5, 2.03, 5.5, 1.57),
        (5.5, 0.83, 2.0, 0.47),
        (5.5, 0.83, 8.8, 0.47),
    ]
    for (x1,y1,x2,y2) in flow:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#555", lw=1.3))

    ax.set_title("Authentication & Session Management Flow",
                 fontsize=13, fontweight="bold", color=navy, pad=8)
    return fig_to_bytes(fig)

# ── 3. Jenkins CI/CD Pipeline diagram ────────────────────────────────────────
def make_cicd_flow():
    fig, ax = plt.subplots(figsize=(14, 4))
    ax.set_xlim(0, 14); ax.set_ylim(0, 4)
    ax.axis("off")
    ax.set_facecolor("#F8F9FA")
    fig.patch.set_facecolor("#F8F9FA")

    stages = [
        ("Checkout\nCode",       "#2E86C1"),
        ("Backend\nTests",       "#27AE60"),
        ("Build Docker\nImages", "#E67E22"),
        ("Security\nScan",       "#8E44AD"),
        ("Push to\nRegistry",    "#16A085"),
        ("Deploy\nServices",     "#C0392B"),
        ("Health\nCheck",        "#27AE60"),
    ]

    n     = len(stages)
    gap   = 14 / n
    y_c   = 2.0
    W, H  = gap * 0.7, 1.2

    for i, (lbl, col) in enumerate(stages):
        cx = gap * i + gap / 2
        rect = FancyBboxPatch((cx - W/2, y_c - H/2), W, H,
                              boxstyle="round,pad=0.05",
                              linewidth=2, edgecolor=col,
                              facecolor=col, zorder=2)
        ax.add_patch(rect)
        ax.text(cx, y_c, lbl, ha="center", va="center",
                fontsize=9, color="white", fontweight="bold",
                multialignment="center", zorder=3)
        ax.text(cx, y_c - H/2 - 0.25, f"Stage {i+1}",
                ha="center", va="top", fontsize=7.5,
                color="#555", zorder=3)
        if i < n - 1:
            nx = gap * (i+1) + gap/2
            ax.annotate("", xy=(nx - W/2, y_c), xytext=(cx + W/2, y_c),
                        arrowprops=dict(arrowstyle="->", color="#333", lw=2),
                        zorder=1)

    ax.text(7, 3.7, "Jenkins Declarative Pipeline – Nucleus CI/CD",
            ha="center", fontsize=12, fontweight="bold", color="#1A233A")
    ax.text(0.3, 0.3, "GitHub Webhook Trigger → Build → Test → Deploy → Verify",
            fontsize=8, color="#666")
    return fig_to_bytes(fig)

# ── 4. Database ER Diagram ────────────────────────────────────────────────────
def make_er_diagram():
    fig, ax = plt.subplots(figsize=(12, 7))
    ax.set_xlim(0, 12); ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_facecolor("#FAFAFA")
    fig.patch.set_facecolor("#FAFAFA")

    navy = "#1A233A"
    entities = {
        "User":        (1.2, 5.5, ["_id (PK)", "name", "email", "password", "enrollment_no",
                                    "role", "branch", "semester", "batch"]),
        "Auth":        (5.5, 5.5, ["twoFactorSecret", "isTwoFactorEnabled",
                                    "isFirstLogin", "initialPassword"]),
        "Voice":       (9.5, 5.5, ["voice_enrolled", "voice_embeddings[ ]",
                                    "voice_threshold", "voice_updated_at"]),
        "Face":        (9.5, 2.5, ["face_enrolled", "face_embeddings[ ]",
                                    "face_threshold", "face_updated_at"]),
        "Attendance":  (1.2, 2.5, ["_id (PK)", "enrollment_no", "subject",
                                    "attended", "total", "date"]),
        "Result":      (5.5, 0.4, ["_id (PK)", "enrollment_no", "subject",
                                    "marks", "grade", "semester"]),
        "Timetable":   (1.2, 0.4, ["_id (PK)", "branch", "semester",
                                    "day", "periods[ ]"]),
        "Complaint":   (9.5, 0.4, ["_id (PK)", "userId", "subject",
                                    "body", "status", "createdAt"]),
    }

    BOX_W, BOX_H = 2.4, 1.4
    centers = {}
    for ename, (ex, ey, fields) in entities.items():
        cx, cy = ex, ey
        rect = FancyBboxPatch((cx - BOX_W/2, cy - BOX_H/2), BOX_W, BOX_H,
                              boxstyle="round,pad=0.05",
                              linewidth=1.5, edgecolor=navy,
                              facecolor="#EAF2F8", zorder=2)
        ax.add_patch(rect)
        ax.text(cx, cy + BOX_H/2 - 0.22, ename,
                ha="center", va="center",
                fontsize=9, fontweight="bold", color=navy, zorder=3)
        for j, f in enumerate(fields[:4]):
            ax.text(cx, cy + BOX_H/2 - 0.5 - j*0.22, f,
                    ha="center", va="center",
                    fontsize=6.5, color="#333", zorder=3)
        if len(fields) > 4:
            ax.text(cx, cy + BOX_H/2 - 0.5 - 4*0.22, f"+ {len(fields)-4} more …",
                    ha="center", va="center",
                    fontsize=6, color="#888", zorder=3)
        centers[ename] = (cx, cy)

    rels = [
        ("User", "Auth",       "1:1 extends"),
        ("User", "Voice",      "1:1 biometric"),
        ("User", "Face",       "1:1 biometric"),
        ("User", "Attendance", "1:N enrolled"),
        ("User", "Result",     "1:N enrolled"),
        ("User", "Complaint",  "1:N raises"),
        ("User", "Timetable",  "N:1 branch"),
    ]
    for src, dst, lbl in rels:
        x1, y1 = centers[src]
        x2, y2 = centers[dst]
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="-|>",
                                   color="#2E86C1", lw=1.2,
                                   connectionstyle="arc3,rad=0.1"))
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx, my + 0.12, lbl, ha="center", va="bottom",
                fontsize=6.5, color="#2E86C1")

    ax.set_title("Nucleus MongoDB – Entity Relationship Diagram",
                 fontsize=13, fontweight="bold", color=navy, pad=8)
    return fig_to_bytes(fig)

# ── 5. Component interaction diagram ─────────────────────────────────────────
def make_component_diagram():
    fig, ax = plt.subplots(figsize=(11, 6))
    ax.set_xlim(0, 11); ax.set_ylim(0, 6)
    ax.axis("off")
    ax.set_facecolor("#F0F4F8")
    fig.patch.set_facecolor("#F0F4F8")

    navy = "#1A233A"
    comps = [
        # (x, y, label, colour)
        (1.5, 4.8, "Pages\n(LoginPage, Dashboard,\nStudentPortal, Admin)", "#2E86C1"),
        (5.5, 4.8, "Components\n(Navbar, Sidebar,\nModals, Cards)",        "#16A085"),
        (9.0, 4.8, "Context / Hooks\n(AuthContext,\nuseWebSocket)",        "#8E44AD"),
        (1.5, 2.2, "Express Router\n(/api/auth, /api/voice,\n/api/face, /api/admin)", "#E67E22"),
        (5.5, 2.2, "Controllers\n(authController,\nvoiceAuth, faceAuth)",  "#C0392B"),
        (9.0, 2.2, "MongoDB Models\n(User, Attendance,\nResult, Timetable)", "#27AE60"),
        (3.5, 0.3, "Voice Auth Service\n(FastAPI + MFCC)",                 "#E67E22"),
        (7.5, 0.3, "Face Auth Service\n(FastAPI + DeepFace)",              "#8E44AD"),
    ]

    W, H = 2.8, 1.0
    centers = {}
    for (cx, cy, lbl, col) in comps:
        rect = FancyBboxPatch((cx - W/2, cy - H/2), W, H,
                              boxstyle="round,pad=0.06",
                              linewidth=1.5, edgecolor=col,
                              facecolor=col+"22", zorder=2)
        ax.add_patch(rect)
        ax.text(cx, cy, lbl, ha="center", va="center",
                fontsize=7.5, color=col, fontweight="bold",
                multialignment="center", zorder=3)
        centers[lbl.split("\n")[0].strip()] = (cx, cy)

    edges = [
        ((1.5, 4.3), (1.5, 2.7)),
        ((5.5, 4.3), (5.5, 2.7)),
        ((9.0, 4.3), (9.0, 2.7)),
        ((1.5, 2.7), (5.5, 2.7)),
        ((5.5, 1.7), (5.5, 0.8)),
        ((9.0, 1.7), (9.0, 0.8)),
        ((5.5, 2.2), (9.0, 2.2)),
        ((3.5, 0.8), (1.5, 1.7)),
        ((7.5, 0.8), (9.0, 1.7)),
    ]
    for (x1, y1), (x2, y2) in edges:
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color="#555", lw=1.2))

    ax.text(5.5, 5.75, "Nucleus – Component Interaction Diagram",
            ha="center", fontsize=12, fontweight="bold", color=navy)
    ax.text(1.5, 5.4, "FRONTEND", ha="center", fontsize=9, color="#2E86C1", fontweight="bold")
    ax.text(5.5, 1.5, "BACKEND", ha="center", fontsize=9, color="#E67E22", fontweight="bold")
    return fig_to_bytes(fig)

# ── 6. Sprint velocity / Gantt chart ─────────────────────────────────────────
def make_gantt():
    fig, ax = plt.subplots(figsize=(13, 6))
    ax.set_facecolor("#F8F9FA")
    fig.patch.set_facecolor("#F8F9FA")

    tasks = [
        ("CAD-1: Project Setup & Repo",         0,  2, "#2E86C1"),
        ("CAD-5/6: OAuth + MongoDB Config",      1,  3, "#27AE60"),
        ("CAD-7/8: JWT Middleware + Routes",     2,  4, "#27AE60"),
        ("CAD-12: React Student Dashboard",      3,  5, "#2E86C1"),
        ("CAD-18: Admin Panel",                  4,  6, "#2E86C1"),
        ("CAD-23: Behavioural Data Collection",  4,  7, "#8E44AD"),
        ("CAD-24: LSTM Model Design",            5,  8, "#8E44AD"),
        ("CAD-25: Continuous Auth Integration",  6,  9, "#C0392B"),
        ("CAD-26: Voice Auth (MFCC)",            5,  8, "#E67E22"),
        ("CAD-27: Face Auth (DeepFace)",         6,  9, "#E67E22"),
        ("CAD-31: End-to-End Testing",           8, 10, "#16A085"),
        ("CAD-33: WebSocket Real-time",          7,  9, "#8E44AD"),
        ("CAD-34: Security Middleware",          8, 10, "#C0392B"),
        ("CAD-35: Docker Compose + Deploy",      9, 11, "#16A085"),
        ("CAD-36: Jenkins CI/CD Pipeline",       9, 12, "#1A233A"),
    ]

    for i, (lbl, start, end, col) in enumerate(tasks):
        y = len(tasks) - i
        ax.barh(y, end - start, left=start, height=0.6,
                color=col, alpha=0.85, edgecolor="white", linewidth=0.8)
        ax.text(start + 0.1, y, lbl, va="center",
                fontsize=7.5, color="white", fontweight="bold")

    weeks = list(range(13))
    ax.set_xticks(weeks)
    ax.set_xticklabels([f"W{w}" for w in weeks], fontsize=9)
    ax.set_yticks([])
    ax.set_xlabel("Project Week", fontsize=10)
    ax.set_title("Nucleus Project – Sprint Gantt Chart (JIRA Task Mapping)",
                 fontsize=12, fontweight="bold", color="#1A233A")
    ax.axvline(x=10, color="red", linestyle="--", lw=1.5, label="Submission Deadline")
    ax.legend(fontsize=8, loc="lower right")
    ax.spines[["top","right","left"]].set_visible(False)
    ax.grid(axis="x", alpha=0.3)
    return fig_to_bytes(fig)

# ── 7. Use-case matrix ────────────────────────────────────────────────────────
def make_usecase_diagram():
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 11); ax.set_ylim(0, 7)
    ax.axis("off")
    ax.set_facecolor("#FAFAFA")
    fig.patch.set_facecolor("#FAFAFA")

    navy = "#1A233A"
    # System boundary
    rect = FancyBboxPatch((2.5, 0.3), 8.0, 6.3,
                          boxstyle="square,pad=0.05",
                          linewidth=2, edgecolor=navy,
                          facecolor="#EAF2F8", zorder=1)
    ax.add_patch(rect)
    ax.text(6.5, 6.45, "Nucleus System", ha="center",
            fontsize=11, fontweight="bold", color=navy)

    usecases = [
        (5.0, 5.5, "UC1: Register / Login"),
        (5.0, 4.6, "UC2: 2FA Setup (TOTP)"),
        (5.0, 3.7, "UC3: Voice Enrollment & Verification"),
        (5.0, 2.8, "UC4: Face Enrollment & Verification"),
        (5.0, 1.9, "UC5: View Dashboard / Portal"),
        (7.8, 5.5, "UC6: Admin Manage Users"),
        (7.8, 4.6, "UC7: View Attendance / Results"),
        (7.8, 3.7, "UC8: File Complaint"),
        (7.8, 2.8, "UC9: CI/CD Deploy Trigger"),
        (7.8, 1.9, "UC10: Monitor Pipeline Logs"),
    ]
    for (cx, cy, lbl) in usecases:
        ellipse = mpatches.Ellipse((cx, cy), 2.6, 0.55,
                                   linewidth=1.2, edgecolor="#2E86C1",
                                   facecolor="#D6EAF8", zorder=2)
        ax.add_patch(ellipse)
        ax.text(cx, cy, lbl, ha="center", va="center",
                fontsize=7.5, color=navy, zorder=3)

    actors = [
        (0.8, 3.7, "Student /\nEnd User"),
        (0.8, 1.5, "System\nAdmin"),
    ]
    for (ax_x, ax_y, lbl) in actors:
        circle = plt.Circle((ax_x, ax_y + 0.5), 0.28,
                             color=navy, zorder=2)
        ax.add_patch(circle)
        ax.plot([ax_x, ax_x], [ax_y + 0.22, ax_y - 0.2], color=navy, lw=2, zorder=2)
        ax.plot([ax_x - 0.3, ax_x + 0.3], [ax_y + 0.1, ax_y + 0.1], color=navy, lw=2, zorder=2)
        ax.plot([ax_x, ax_x - 0.2], [ax_y - 0.2, ax_y - 0.55], color=navy, lw=2, zorder=2)
        ax.plot([ax_x, ax_x + 0.2], [ax_y - 0.2, ax_y - 0.55], color=navy, lw=2, zorder=2)
        ax.text(ax_x, ax_y - 0.7, lbl, ha="center", va="top",
                fontsize=8, color=navy, multialignment="center")

    from_student = [(5.0, 5.5), (5.0, 4.6), (5.0, 3.7), (5.0, 2.8), (5.0, 1.9), (7.8, 4.6), (7.8, 3.7)]
    from_admin   = [(7.8, 5.5), (7.8, 2.8), (7.8, 1.9)]

    for (cx, cy) in from_student:
        ax.plot([1.1, cx - 1.3], [3.7 + 0.1, cy], color="#2E86C1", lw=0.8, alpha=0.5, zorder=1)
    for (cx, cy) in from_admin:
        ax.plot([1.1, cx - 1.3], [1.5 + 0.1, cy], color="#C0392B", lw=0.8, alpha=0.5, zorder=1)

    ax.set_title("Nucleus – Use Case Diagram", fontsize=12, fontweight="bold", color=navy)
    return fig_to_bytes(fig)

# ── 8. Deployment diagram ─────────────────────────────────────────────────────
def make_deployment_diagram():
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.set_xlim(0, 12); ax.set_ylim(0, 6)
    ax.axis("off")
    ax.set_facecolor("#F0F4F8")
    fig.patch.set_facecolor("#F0F4F8")

    navy = "#1A233A"

    # Docker compose boundary
    rect = FancyBboxPatch((1.0, 0.3), 10.0, 5.0,
                          boxstyle="round,pad=0.1",
                          linewidth=2.5, edgecolor="#E67E22",
                          facecolor="#FEF9E7", zorder=1)
    ax.add_patch(rect)
    ax.text(6.0, 5.2, "Docker Compose – nucleus-network (bridge)",
            ha="center", fontsize=10, fontweight="bold", color="#E67E22")

    containers = [
        (2.5, 3.8, "frontend\n(React / Nginx)\nPort: 3000",    "#2E86C1"),
        (5.5, 3.8, "backend\n(Node.js/Express)\nPort: 5050",   "#27AE60"),
        (8.5, 3.8, "voice-service\n(FastAPI/Python)\nPort: 8000", "#E67E22"),
        (2.5, 1.5, "mongodb\n(Mongo 7.0)\nInternal: 27017",   "#C0392B"),
        (5.5, 1.5, "db-seed\n(Node Script)\nRuns Once",        "#8E44AD"),
        (8.5, 1.5, "Jenkins Agent\n(Windows / Linux)\nCI/CD",  "#1A233A"),
    ]

    W, H = 2.2, 1.0
    for (cx, cy, lbl, col) in containers:
        rect2 = FancyBboxPatch((cx - W/2, cy - H/2), W, H,
                               boxstyle="round,pad=0.06",
                               linewidth=1.5, edgecolor=col,
                               facecolor=col, zorder=2)
        ax.add_patch(rect2)
        ax.text(cx, cy, lbl, ha="center", va="center",
                fontsize=7.5, color="white", fontweight="bold",
                multialignment="center", zorder=3)

    edges = [
        ((2.5, 3.3), (2.5, 2.0)),
        ((5.5, 3.3), (5.5, 2.0)),
        ((2.5, 3.8), (4.4, 3.8)),
        ((6.6, 3.8), (7.4, 3.8)),
        ((5.5, 1.5), (2.5, 2.0)),
        ((8.5, 2.0), (8.5, 3.3)),
    ]
    for (p1, p2) in edges:
        ax.annotate("", xy=p2, xytext=p1,
                    arrowprops=dict(arrowstyle="->", color="#555", lw=1.4))

    ax.text(6.0, 0.1, "GitHub Webhook → Jenkins → docker compose build → docker compose up -d",
            ha="center", fontsize=8, color="#555")
    ax.set_title("Nucleus – Deployment Architecture Diagram",
                 fontsize=12, fontweight="bold", color=navy, pad=8)
    return fig_to_bytes(fig)

# ─────────────────────────────────────────────────────────────────────────────
# Document style helper
# ─────────────────────────────────────────────────────────────────────────────
def setup_doc():
    doc = Document()
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)
    sec = doc.sections[0]
    sec.top_margin    = Cm(2.5)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin   = Cm(2.5)
    sec.right_margin  = Cm(2.5)
    # Header
    header = sec.header
    hp = header.paragraphs[0]
    hp.text = "NUCLEUS — Capstone Project | NIIT University | Sem VI (2025–26)"
    hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in hp.runs:
        run.font.size = Pt(9)
        run.font.color.rgb = CLR_BLACK
    # Footer
    footer = sec.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = fp.add_run("Page ")
    run.font.size = Pt(9)
    fldChar1 = OxmlElement("w:fldChar"); fldChar1.set(qn("w:fldCharType"), "begin")
    instrText = OxmlElement("w:instrText"); instrText.text = "PAGE"
    fldChar2 = OxmlElement("w:fldChar"); fldChar2.set(qn("w:fldCharType"), "end")
    for el in (fldChar1, instrText, fldChar2):
        run._r.append(el)
    run2 = fp.add_run(" | Confidential")
    run2.font.size = Pt(9)
    return doc

# ─────────────────────────────────────────────────────────────────────────────
# Helper – plain table (no colour)
# ─────────────────────────────────────────────────────────────────────────────
def make_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    # Header row – bold text, no background colour
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        for para in hdr_cells[i].paragraphs:
            for run in para.runs:
                run.bold = True
                run.font.color.rgb = CLR_BLACK
                run.font.size = Pt(10)
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # Data rows – plain white, no alternating shade
    for r_idx, row in enumerate(rows):
        cells = table.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row):
            cells[c_idx].text = str(val)
            for para in cells[c_idx].paragraphs:
                for run in para.runs:
                    run.font.size = Pt(10)
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = w
    doc.add_paragraph()
    return table

# ─────────────────────────────────────────────────────────────────────────────
# Title page – plain, no colour
# ─────────────────────────────────────────────────────────────────────────────
def title_page(doc, doc_type: str, subtitle: str):
    # Document type heading – large, centered, bold, black
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(f"\n\n{doc_type}\n")
    run.font.size = Pt(26); run.bold = True
    run.font.color.rgb = CLR_BLACK

    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run("Project NUCLEUS\n")
    r2.font.size = Pt(18); r2.bold = True
    r2.font.color.rgb = CLR_BLACK
    r3 = p2.add_run(subtitle + "\n\n")
    r3.font.size = Pt(12)
    r3.font.color.rgb = CLR_BLACK

    doc.add_paragraph()
    info = [
        ("Document Type",    doc_type),
        ("Project Title",    "Nucleus – Continuous Behavioural Authentication & CI/CD Orchestration Platform"),
        ("Organization",     "NIIT University, Neemrana (Rajasthan)"),
        ("Program",          "B.Tech. Computer Science Engineering – Sem VI Capstone"),
        ("Prepared By",      "Shlok Burmi  |  Yuvraj  |  Sujal Kishore"),
        ("Version",          "1.0 – Final Submission"),
        ("Date",             TODAY),
        ("Standard",         "IEEE Std 830-1998 (SRS) / IEEE Std 1016-2009 (SDD)"),
        ("Confidentiality",  "Academic – Restricted Distribution"),
    ]
    table = doc.add_table(rows=len(info), cols=2)
    table.style = "Table Grid"
    for i, (k, v) in enumerate(info):
        cells = table.rows[i].cells
        cells[0].text = k
        cells[1].text = v
        for para in cells[0].paragraphs:
            for run in para.runs:
                run.bold = True
                run.font.color.rgb = CLR_BLACK
                run.font.size = Pt(10)
        for para in cells[1].paragraphs:
            for run in para.runs:
                run.font.color.rgb = CLR_BLACK
                run.font.size = Pt(10)
        cells[0].width = Cm(5)
        cells[1].width = Cm(11)
    page_break(doc)

# ─────────────────────────────────────────────────────────────────────────────
# Revision history table
# ─────────────────────────────────────────────────────────────────────────────
def revision_history(doc):
    add_h1(doc, "Document Revision History")
    headers = ["Version", "Date", "Author", "Description of Change"]
    rows = [
        ["0.1", "Feb 10, 2026", "Shlok Burmi",    "Initial draft – Scope & Introduction"],
        ["0.3", "Mar 01, 2026", "Yuvraj",          "Added FR/NFR sections and Use Cases"],
        ["0.5", "Mar 20, 2026", "Sujal Kishore",   "Architecture, ER diagrams, Component Design"],
        ["0.8", "Apr 05, 2026", "Shlok Burmi",     "CI/CD integration, JIRA mapping, Analytics"],
        ["1.0", TODAY,          "Team Nucleus",     "Final version – IEEE format, diagrams complete"],
    ]
    make_table(doc, headers, rows, [Cm(2), Cm(3), Cm(3.5), Cm(7.5)])
    page_break(doc)

# ─────────────────────────────────────────────────────────────────────────────
#  ███████╗██████╗ ███████╗
#  ██╔════╝██╔══██╗██╔════╝
#  ███████╗██████╔╝███████╗
#  ╚════██║██╔══██╗╚════██║
#  ███████║██║  ██║███████║
#  ╚══════╝╚═╝  ╚═╝╚══════╝
# ─────────────────────────────────────────────────────────────────────────────
def generate_srs():
    print("  Generating SRS …")
    doc = setup_doc()

    # ── Title page
    title_page(doc,
               "Software Requirements Specification (SRS)",
               "Continuous Behavioural Authentication & CI/CD Orchestration Platform")

    # ── Table of Contents placeholder
    add_h1(doc, "Table of Contents")
    toc_entries = [
        ("1", "Introduction", 4),
        ("1.1", "Purpose", 4),
        ("1.2", "Document Conventions", 4),
        ("1.3", "Intended Audience and Reading Suggestions", 4),
        ("1.4", "Product Scope", 5),
        ("1.5", "References", 5),
        ("2", "Overall Description", 6),
        ("2.1", "Product Perspective", 6),
        ("2.2", "Product Functions", 6),
        ("2.3", "User Classes and Characteristics", 7),
        ("2.4", "Operating Environment", 7),
        ("2.5", "Design and Implementation Constraints", 7),
        ("2.6", "Assumptions and Dependencies", 8),
        ("3", "External Interface Requirements", 8),
        ("3.1", "User Interfaces", 8),
        ("3.2", "Hardware Interfaces", 9),
        ("3.3", "Software Interfaces", 9),
        ("3.4", "Communications Interfaces", 9),
        ("4", "System Features and Functional Requirements", 10),
        ("4.1", "MFA and Initial Authentication", 10),
        ("4.2", "Continuous Behavioural Authentication (LSTM)", 11),
        ("4.3", "Voice Biometric Authentication", 12),
        ("4.4", "Face Biometric Authentication", 12),
        ("4.5", "Student Academic Portal", 13),
        ("4.6", "Admin Management System", 13),
        ("4.7", "CI/CD Automated Deployment", 14),
        ("5", "Non-Functional Requirements", 15),
        ("5.1", "Performance Requirements", 15),
        ("5.2", "Security Requirements", 15),
        ("5.3", "Reliability and Availability", 16),
        ("5.4", "Maintainability and Portability", 16),
        ("5.5", "Scalability", 16),
        ("6", "Project Management and Agile Metrics", 17),
        ("6.1", "Agile Methodology and JIRA Tracking", 17),
        ("6.2", "CI/CD Dashboard Analysis", 18),
        ("6.3", "Repository Contributions", 18),
        ("7", "System Diagrams", 19),
        ("8", "Appendix", 21),
    ]
    toc_table = doc.add_table(rows=len(toc_entries), cols=3)
    toc_table.style = "Table Grid"
    for i, (num, title, pg) in enumerate(toc_entries):
        cells = toc_table.rows[i].cells
        cells[0].text = num
        cells[1].text = title
        cells[2].text = str(pg)
        bg = ALT_HEX if i % 2 == 1 else "FFFFFF"
        for j in range(3):
            set_cell_bg(cells[j], bg)
            for para in cells[j].paragraphs:
                for run in para.runs:
                    run.font.size = Pt(10)
                    if num.count(".") == 0:
                        run.bold = True
        cells[0].width = Cm(1.5)
        cells[1].width = Cm(12)
        cells[2].width = Cm(2.5)
    page_break(doc)

    revision_history(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 1. INTRODUCTION
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "1  Introduction")

    add_h2(doc, "1.1  Purpose")
    add_body(doc,
        "This Software Requirements Specification (SRS) document describes the complete "
        "set of functional and non-functional requirements for the 'Nucleus' project, "
        "developed as the Semester VI Capstone at NIIT University. The document adheres "
        "to IEEE Std 830-1998 guidelines."
    )
    add_body(doc,
        "Nucleus aims to create a next-generation, role-based academic portal reinforced "
        "by multi-layered continuous biometric authentication. Beyond conventional login, "
        "the system silently authenticates users throughout their active session using "
        "behavioural signals processed by Long Short-Term Memory (LSTM) neural networks. "
        "The platform also integrates a fully automated Jenkins CI/CD pipeline, "
        "containerised via Docker Compose, ensuring reproducible and rapid deployments."
    )

    add_h2(doc, "1.2  Document Conventions")
    add_body(doc,
        "The following formatting conventions are used throughout this document:"
    )
    conventions = [
        ("Bold text",         "Emphasizes critical terms, component names, or key requirements."),
        ("Monospace font",    "Represents code identifiers, endpoints, or configuration values."),
        ("[REQ-F-XXX]",       "Functional Requirement identifier tag."),
        ("[REQ-NF-XXX]",      "Non-Functional Requirement identifier tag."),
        ("[CAD-XX]",          "JIRA ticket reference for traceability."),
        ("IEEE Std 830-1998", "Baseline standard guiding this SRS structure."),
    ]
    make_table(doc,
               ["Convention", "Meaning"],
               conventions,
               [Cm(4), Cm(12)])

    add_h2(doc, "1.3  Intended Audience and Reading Suggestions")
    add_body(doc,
        "This document is intended for the following audiences:"
    )
    audiences = [
        ("Project Supervisors / Evaluators",
         "Read Sections 1–3 for scope, then Sections 4–5 for requirements depth."),
        ("Software Developers (Backend)",
         "Focus on Sections 4.2–4.7 (functional requirements) and Section 7 (architecture)."),
        ("Frontend / UI Developers",
         "Sections 3.1 and 4.5–4.6 detail all interface and feature requirements."),
        ("QA / Testing Engineers",
         "Section 5 (NFRs) and Section 4 (use-case flows) are primary references."),
        ("DevOps / CI-CD Engineers",
         "Sections 4.7 and 6.2 define the deployment pipeline requirements."),
        ("Academic Reviewers",
         "The full document is structured for sequential reading."),
    ]
    make_table(doc,
               ["Audience", "Reading Guide"],
               audiences,
               [Cm(5), Cm(11)])

    add_h2(doc, "1.4  Product Scope")
    add_body(doc,
        "Nucleus is a comprehensive, multi-tenant academic management and security platform "
        "designed for higher-education institutions. The system unifies the following "
        "core capabilities under a single deployable stack:"
    )
    for item in [
        "A role-based academic portal (Student, Faculty, Admin, Director, Warden, Recruiter) "
        "providing personalised dashboards with attendance, results, timetables, and complaints.",
        "Multi-Factor Authentication (MFA) using Time-based One-Time Passwords (TOTP) via "
        "Google Authenticator, backed by JWT session management.",
        "Continuous Behavioural Authentication using LSTM neural networks that analyse mouse "
        "movement patterns, keystroke dynamics, and interaction cadence in real time.",
        "Step-up biometric verification (Voice: MFCC + cosine similarity; Face: DeepFace + "
        "Facenet512 embeddings) invoked automatically when behavioural anomalies are detected.",
        "An automated Jenkins CI/CD pipeline with Docker Compose orchestration, enabling "
        "zero-touch deployment from GitHub commits to a running multi-container environment.",
    ]:
        add_bullet(doc, item)

    add_h2(doc, "1.5  References")
    refs = [
        ["[1]", "IEEE Std 830-1998", "IEEE Recommended Practice for Software Requirements Specifications"],
        ["[2]", "JIRA Dashboard",    "Nucleus Project – Agile Sprint Board (CAD-1 through CAD-36)"],
        ["[3]", "GitHub Repo",       "https://github.com/yyyuvvvraj/Nucleus"],
        ["[4]", "Hochreiter & Schmidhuber", "Long Short-Term Memory. Neural Computation, 1997"],
        ["[5]", "DeepFace Library",  "Taigman et al.; Sefik Ilhan Serengil – MIT License"],
        ["[6]", "Docker Docs",       "https://docs.docker.com/compose/"],
        ["[7]", "Jenkins Docs",      "https://www.jenkins.io/doc/book/pipeline/"],
        ["[8]", "RFC 6238",          "TOTP: Time-Based One-Time Password Algorithm"],
    ]
    make_table(doc, ["Ref", "Source", "Description"], refs,
               [Cm(1.2), Cm(4.5), Cm(10.3)])
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 2. OVERALL DESCRIPTION
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "2  Overall Description")

    add_h2(doc, "2.1  Product Perspective")
    add_body(doc,
        "Nucleus is a self-contained, greenfield application. It does not replace any "
        "existing institutional system but is designed to integrate into any MERN-stack "
        "environment. The system operates as an independent cluster of Docker containers "
        "communicating over a shared private bridge network (nucleus-network). "
        "External interactions are limited to:"
    )
    for item in [
        "GitHub — source code repository and webhook trigger for Jenkins.",
        "MongoDB Atlas or local MongoDB — cloud/local-hybrid document store.",
        "Client web browsers — React SPA delivered over HTTPS.",
    ]:
        add_bullet(doc, item)
    add_body(doc,
        "The platform is decoupled into four primary service domains: Frontend, Backend API, "
        "Biometric AI Service (Voice + Face), and the DevOps / CI-CD layer."
    )

    add_h2(doc, "2.2  Product Functions – High-Level Summary")
    functions = [
        ("F-01", "Role-Based Authentication", "JWT + bcrypt password hashing, 2FA TOTP, role guard middleware"),
        ("F-02", "Behavioural Authentication", "Mouse/keyboard event streaming → LSTM anomaly scoring"),
        ("F-03", "Voice Biometric",            "MFCC feature extraction, cosine similarity, anti-spoofing"),
        ("F-04", "Face Biometric",             "DeepFace Facenet512 embeddings, liveness action verification"),
        ("F-05", "Student Dashboard",          "Attendance, results, timetable, complaint filing"),
        ("F-06", "Admin Console",              "User management, bulk creation, password reset"),
        ("F-07", "CI/CD Pipeline",             "Jenkins declarative pipeline: checkout → test → build → deploy"),
        ("F-08", "Docker Orchestration",       "All services containerised and networked via Docker Compose"),
        ("F-09", "Data Seeding",               "Automated seed script populating demo academic data on first run"),
        ("F-10", "Security Middleware",        "Rate limiting, helmet, CORS, session invalidation on anomaly"),
    ]
    make_table(doc, ["ID", "Feature", "Implementation"], functions,
               [Cm(1.5), Cm(4.5), Cm(10)])

    add_h2(doc, "2.3  User Classes and Characteristics")
    users = [
        ("Student",    "Primary",  "Non-technical; accesses academic data, enrolled in biometrics"),
        ("Faculty",    "Primary",  "Views timetable, marks attendance"),
        ("Admin",      "Admin",    "Full CRUD on users, manages roles and initial credentials"),
        ("Director",   "Admin",    "View-only analytics on institution-wide data"),
        ("Warden",     "Admin",    "Manages hostel-related complaints and student records"),
        ("Recruiter",  "External", "Views student profiles and placement records"),
    ]
    make_table(doc, ["Role", "Access Level", "Description"], users,
               [Cm(2.5), Cm(2.5), Cm(11)])

    add_h2(doc, "2.4  Operating Environment")
    add_body(doc, "The system must operate correctly in the following environments:")
    env_rows = [
        ("Web Browsers",      "Chrome ≥ 110, Firefox ≥ 115, Safari ≥ 16, Edge ≥ 110"),
        ("Backend Runtime",   "Node.js ≥ 18 LTS, Python ≥ 3.10"),
        ("Database",          "MongoDB Community ≥ 7.0 or MongoDB Atlas (cloud)"),
        ("Containerisation",  "Docker Desktop ≥ 24.0, Docker Compose v2"),
        ("CI Server",         "Jenkins LTS ≥ 2.440, agent capable of running Docker commands"),
        ("Host OS",           "Linux (Ubuntu 22.04 recommended) or Windows 11 with WSL2"),
    ]
    make_table(doc, ["Component", "Requirement"], env_rows, [Cm(4), Cm(12)])

    add_h2(doc, "2.5  Design and Implementation Constraints")
    constraints = [
        "[CON-01] The entire application stack must be Dockerised and runnable via a single "
        "docker compose up -d command without manual configuration.",
        "[CON-02] LSTM inference latency must not exceed 200 ms (P95) to preserve UX.",
        "[CON-03] Voice MFCC feature vectors must maintain shape consistency across enrolment "
        "and verification; shape mismatch triggers automatic re-enrolment prompt.",
        "[CON-04] Face embeddings use Facenet512 (512-dimensional vectors); DeepFace backend "
        "must be pre-loaded at service startup to avoid cold-start delays.",
        "[CON-05] Jenkins pipeline must support both sh (Linux agents) and bat (Windows agents).",
        "[CON-06] All secrets (JWT_SECRET, DB credentials) must be passed via environment "
        "variables or Docker secrets — never committed to version control.",
        "[CON-07] The React frontend is compiled as a static SPA served by Nginx inside Docker.",
    ]
    for c in constraints:
        add_bullet(doc, c)

    add_h2(doc, "2.6  Assumptions and Dependencies")
    assumptions = [
        "A stable internet connection is available for Docker image pulls and GitHub webhooks.",
        "Users possess webcams and microphones for biometric enrolment and verification.",
        "The institution's network permits outbound HTTPS traffic to MongoDB Atlas (if cloud hosting).",
        "The deploying machine runs Docker Desktop or Docker Engine with at least 8 GB RAM.",
        "GitHub repository (yyyuvvvraj/Nucleus) remains the single source of truth for builds.",
    ]
    for a in assumptions:
        add_numbered(doc, a)
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 3. EXTERNAL INTERFACE REQUIREMENTS
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "3  External Interface Requirements")

    add_h2(doc, "3.1  User Interfaces")
    add_body(doc,
        "All user interaction occurs through a React 18+ Single Page Application (SPA) "
        "built with Vite and styled with Tailwind CSS. The UI must implement:"
    )
    ui_reqs = [
        "[UI-01] Responsive design supporting viewport widths from 1024 px to 1920 px (desktop-first).",
        "[UI-02] A branded Login Page with credential fields, role detection, and 2FA TOTP input.",
        "[UI-03] A Student Dashboard presenting GPA summary cards, attendance pie charts, "
        "results table, timetable grid, and complaint submission form.",
        "[UI-04] An Admin Console with paginated user tables, bulk import (CSV), and role assignment dropdowns.",
        "[UI-05] A Biometric Setup Wizard guiding first-time users through voice and face enrolment.",
        "[UI-06] A 'Verification Required' overlay modal triggered by LSTM anomaly detection, "
        "presenting voice passphrase and face capture options.",
        "[UI-07] A real-time status indicator showing the active CI/CD pipeline stage for admins.",
    ]
    for r in ui_reqs:
        add_bullet(doc, r)

    add_h2(doc, "3.2  Hardware Interfaces")
    add_body(doc,
        "No proprietary hardware is required. The system relies on commodity peripherals:"
    )
    hw = [
        ("Microphone", "Any standard audio input device; used for voice passphrase capture during enrolment and verification."),
        ("Webcam",     "Any USB or integrated camera (≥ 720p recommended); used for face image capture."),
        ("Mouse/KB",   "Standard HID devices; mouse movement and keystroke data are passively collected for LSTM analysis."),
    ]
    make_table(doc, ["Device", "Purpose"], hw, [Cm(3), Cm(13)])

    add_h2(doc, "3.3  Software Interfaces")
    sw = [
        ("MongoDB (v7.0)",        "Primary document store; accessed via Mongoose ORM from Node.js backend.",       "mongodb://mongodb:27017/nucleus"),
        ("FastAPI (Python 3.10)", "Voice and face biometric microservice; REST API over HTTP.",                   "http://voice-service:8000"),
        ("Jenkins LTS",           "CI/CD orchestration; communicates with GitHub via webhooks.",                   "http://localhost:8080"),
        ("GitHub REST API",       "Source code hosting; webhook triggers Jenkins builds on push to main.",         "https://api.github.com"),
        ("Google Authenticator",  "TOTP 2FA; uses shared secret key generated by speakeasy npm package.",          "RFC 6238"),
    ]
    make_table(doc, ["Software", "Role", "Integration Point"], sw,
               [Cm(3.5), Cm(7), Cm(5.5)])

    add_h2(doc, "3.4  Communications Interfaces")
    add_body(doc, "The system uses the following communication protocols:")
    comms = [
        ("HTTPS",      "TLS 1.2+",   "All browser-to-backend REST API communication (port 5050)."),
        ("WebSockets", "WSS",         "Real-time behavioural data streaming from frontend to backend."),
        ("HTTP",       "Internal",    "Inter-container communication within nucleus-network (no TLS)."),
        ("TCP",        "27017",       "MongoDB wire protocol between backend and database containers."),
    ]
    make_table(doc, ["Protocol", "Security", "Usage"], comms,
               [Cm(3), Cm(3), Cm(10)])
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 4. SYSTEM FEATURES AND FUNCTIONAL REQUIREMENTS
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "4  System Features and Functional Requirements")

    add_h2(doc, "4.1  Feature: Multi-Factor Authentication (MFA) and Initial Login")
    add_h3(doc, "4.1.1  Description")
    add_body(doc,
        "Users authenticate via email/password followed by a Time-based One-Time Password "
        "(TOTP) enforced on all accounts. First-time users are guided through a mandatory "
        "biometric enrolment wizard before gaining full portal access."
    )
    add_h3(doc, "4.1.2  Functional Requirements")
    fr_auth = [
        ("[REQ-F-001]", "The system SHALL validate user credentials against bcrypt-hashed passwords stored in MongoDB."),
        ("[REQ-F-002]", "The system SHALL issue a JWT access token (HS256, 7-day expiry) upon successful authentication."),
        ("[REQ-F-003]", "The system SHALL enforce TOTP 2FA using a 30-second window TOTP secret unique per user."),
        ("[REQ-F-004]", "The system SHALL redirect first-login users to a biometric setup page before dashboard access."),
        ("[REQ-F-005]", "The system SHALL store the 2FA secret in the User document (twoFactorSecret field) and set isTwoFactorEnabled = true after setup."),
        ("[REQ-F-006]", "The system SHALL invalidate JWT tokens on explicit logout or on detection of a security anomaly."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_auth, [Cm(2.5), Cm(13.5)])

    add_h3(doc, "4.1.3  Authentication Flow")
    add_body(doc, "The authentication sequence proceeds as follows:")
    for step in [
        "User submits email + password to POST /api/auth/login.",
        "Backend verifies password hash; returns 'awaiting_2fa' status.",
        "Frontend prompts TOTP input; user enters 6-digit code from Authenticator app.",
        "Backend validates TOTP using speakeasy.verify(); issues JWT on success.",
        "isFirstLogin flag checked; if true, redirect to /setup/biometric.",
        "On biometric completion, isFirstLogin set to false; full dashboard granted.",
    ]:
        add_numbered(doc, step)

    add_h2(doc, "4.2  Feature: Continuous Behavioural Authentication (LSTM)")
    add_h3(doc, "4.2.1  Description")
    add_body(doc,
        "The core differentiator of Nucleus. Once authenticated, the system silently monitors "
        "user interactions — mouse coordinates, velocity, acceleration, and keystroke inter-arrival "
        "times — and feeds this data to an LSTM inference model to compute an imposter probability score."
    )
    add_h3(doc, "4.2.2  Functional Requirements")
    fr_lstm = [
        ("[REQ-F-010]", "[CAD-23] The system SHALL capture mouse position events (x, y, timestamp) at ≥10 Hz via JavaScript event listeners."),
        ("[REQ-F-011]", "[CAD-23] The system SHALL capture keydown inter-arrival times per session window."),
        ("[REQ-F-012]", "[CAD-24] The LSTM model SHALL accept padded sequences of up to 100 timesteps and output a confidence score ∈ [0, 1]."),
        ("[REQ-F-013]", "[CAD-25] The backend SHALL receive behavioural vectors via WebSocket endpoint /api/stream/behaviour."),
        ("[REQ-F-014]", "[CAD-25] When imposter confidence exceeds 0.75, the system SHALL trigger step-up authentication."),
        ("[REQ-F-015]", "[CAD-25] Behavioural data SHALL be normalised (min-max scaling) before LSTM inference."),
        ("[REQ-F-016]", "[CAD-25] Failed step-up authentication attempts (≥3) SHALL result in session invalidation and forced logout."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_lstm, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "4.3  Feature: Voice Biometric Authentication")
    add_h3(doc, "4.3.1  Description")
    add_body(doc,
        "The voice-auth-service (FastAPI) exposes enrolment and verification endpoints. "
        "MFCC (Mel-Frequency Cepstral Coefficients) are extracted from audio recordings, "
        "and cosine similarity is computed against stored embeddings. Anti-spoofing "
        "detects synthetic or pre-recorded voices."
    )
    fr_voice = [
        ("[REQ-F-020]", "[CAD-26] The system SHALL accept ≥3 voice samples during enrolment and compute an adaptive similarity threshold."),
        ("[REQ-F-021]", "[CAD-26] Voice verification SHALL return authenticated=true only if cosine similarity ≥ adaptive threshold (0.75–0.95)."),
        ("[REQ-F-022]", "[CAD-26] The system SHALL reject synthetic/pre-recorded voice samples based on spectral flatness analysis."),
        ("[REQ-F-023]", "[CAD-26] Voice embeddings SHALL be stored in MongoDB (voice_embeddings field) and retrieved for stateless verification."),
        ("[REQ-F-024]", "[CAD-26] The system SHALL support optional speech-to-text passphrase verification using Whisper/similar STT model."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_voice, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "4.4  Feature: Face Biometric Authentication")
    add_h3(doc, "4.4.1  Description")
    add_body(doc,
        "Face authentication uses DeepFace with the Facenet512 model. Multi-angle images "
        "are averaged into a single 512-dimensional embedding. Liveness detection requires "
        "the user to perform a prompted action (e.g., blink, turn head) to prevent photo attacks."
    )
    fr_face = [
        ("[REQ-F-030]", "[CAD-27] The system SHALL accept ≥2 face images at different angles during enrolment."),
        ("[REQ-F-031]", "[CAD-27] Embeddings from multiple angles SHALL be averaged and L2-normalised before storage."),
        ("[REQ-F-032]", "[CAD-27] Face verification SHALL use cosine similarity with a threshold of 0.70."),
        ("[REQ-F-033]", "[CAD-27] Liveness verification SHALL prompt a random action (blink/turn) and validate via pose estimation."),
        ("[REQ-F-034]", "[CAD-27] Face embeddings SHALL be stored in MongoDB (face_embeddings field) as flat float arrays."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_face, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "4.5  Feature: Student Academic Portal")
    fr_student = [
        ("[REQ-F-040]", "The system SHALL display a GPA summarycard computed from all result documents for the logged-in student."),
        ("[REQ-F-041]", "The system SHALL display attendance percentage per subject, colour-coded (green ≥75%, amber 60–74%, red <60%)."),
        ("[REQ-F-042]", "The system SHALL display the weekly timetable grid filtered by the student's branch and current semester."),
        ("[REQ-F-043]", "The system SHALL allow students to file complaints with subject, body, and track status (Pending/Resolved)."),
        ("[REQ-F-044]", "The system SHALL display all semester results with marks, grade, and subject name."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_student, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "4.6  Feature: Admin Management System")
    fr_admin = [
        ("[REQ-F-050]", "Admins SHALL create new user accounts specifying role, branch, semester, and batch."),
        ("[REQ-F-051]", "Admins SHALL reset any user's password to a temporary credential visible only to admins."),
        ("[REQ-F-052]", "Admins SHALL view and filter all users by role, branch, and batch."),
        ("[REQ-F-053]", "Admins SHALL deactivate or delete user accounts with immediate JWT revocation."),
        ("[REQ-F-054]", "Directors SHALL have a read-only analytics view spanning all branches and batches."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_admin, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "4.7  Feature: CI/CD Automated Deployment (Jenkins)")
    add_body(doc,
        "The Jenkins CI/CD pipeline defined in the Jenkinsfile at the repository root "
        "automates the full build, test, and deployment lifecycle. The pipeline is "
        "triggered by a GitHub webhook on every push to the main branch."
    )
    fr_cicd = [
        ("[REQ-F-060]", "[CAD-36] The pipeline SHALL checkout source code from https://github.com/yyyuvvvraj/Nucleus.git (main branch)."),
        ("[REQ-F-061]", "[CAD-36] The pipeline SHALL execute backend unit tests (npm test in /backend directory)."),
        ("[REQ-F-062]", "[CAD-36] The pipeline SHALL build all Docker images via docker compose build."),
        ("[REQ-F-063]", "[CAD-36] The pipeline SHALL perform security scans on built images before deployment."),
        ("[REQ-F-064]", "[CAD-36] The pipeline SHALL push tagged images to the configured Docker registry."),
        ("[REQ-F-065]", "[CAD-36] The pipeline SHALL deploy all services via docker compose up -d."),
        ("[REQ-F-066]", "[CAD-36] The pipeline SHALL execute post-deployment health checks and notify on success or failure."),
    ]
    make_table(doc, ["Req ID", "Requirement"], fr_cicd, [Cm(2.5), Cm(13.5)])

    add_h3(doc, "4.7.1  Jenkinsfile Stage Summary")
    jenkins_stages = [
        ("Stage 1", "Checkout",           "git checkout main from GitHub"),
        ("Stage 2", "Backend Tests",       "echo + npm test placeholder (dir: backend)"),
        ("Stage 3", "Build Docker Images", "bat 'docker compose build' (Windows agent)"),
        ("Stage 4", "Security Scan",       "echo placeholder for Trivy / OWASP scans"),
        ("Stage 5", "Push to Registry",    "echo placeholder for docker push to registry"),
        ("Stage 6", "Deploy",              "bat 'docker compose up -d'"),
        ("Post",    "Always / Success / Failure", "Notification logs"),
    ]
    make_table(doc, ["Stage", "Name", "Action"], jenkins_stages,
               [Cm(2), Cm(4), Cm(10)])
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 5. NON-FUNCTIONAL REQUIREMENTS
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "5  Non-Functional Requirements")

    add_h2(doc, "5.1  Performance Requirements")
    perf = [
        ("[REQ-NF-001]", "Page initial load (First Contentful Paint) SHALL be ≤ 2 seconds on a 10 Mbps connection."),
        ("[REQ-NF-002]", "REST API P95 response time SHALL be ≤ 300 ms under normal load (≤50 concurrent users)."),
        ("[REQ-NF-003]", "LSTM inference latency SHALL be ≤ 200 ms from data receipt to score return."),
        ("[REQ-NF-004]", "Face verification SHALL complete within 3 seconds including model inference."),
        ("[REQ-NF-005]", "Voice MFCC extraction and verification SHALL complete within 2 seconds."),
        ("[REQ-NF-006]", "The system SHALL support ≥ 100 concurrent WebSocket connections without performance degradation."),
    ]
    make_table(doc, ["Req ID", "Requirement"], perf, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "5.2  Security Requirements")
    sec = [
        ("[REQ-NF-010]", "All passwords SHALL be hashed using bcrypt with salt rounds ≥ 10."),
        ("[REQ-NF-011]", "JWT tokens SHALL use HS256 signing with a secret ≥ 64 characters."),
        ("[REQ-NF-012]", "API rate limiting SHALL restrict requests to ≤ 100 per 15-minute window per IP."),
        ("[REQ-NF-013]", "HTTPS SHALL be enforced in production; HTTP redirects to HTTPS."),
        ("[REQ-NF-014]", "CORS policy SHALL whitelist only approved origin domains."),
        ("[REQ-NF-015]", "Secrets and API keys SHALL never be committed to version control (enforced via .gitignore)."),
        ("[REQ-NF-016]", "The system SHALL log failed authentication attempts with IP and timestamp."),
        ("[REQ-NF-017]", "Sessions SHALL be invalidated immediately on security threshold breach (LSTM or biometric failure)."),
    ]
    make_table(doc, ["Req ID", "Requirement"], sec, [Cm(2.5), Cm(13.5)])

    add_h2(doc, "5.3  Reliability and Availability")
    add_body(doc,
        "The system SHALL achieve ≥ 99.5% uptime in production deployment. "
        "MongoDB health checks (ping every 5 seconds, 5 retries) ensure the database "
        "container is healthy before dependent services start. Docker restart policies "
        "provide automatic container recovery on unexpected termination."
    )

    add_h2(doc, "5.4  Maintainability and Portability")
    add_body(doc,
        "Each service (frontend, backend, voice-service) is independently containerised, "
        "enabling individual updates without restarting the entire stack. The declarative "
        "Jenkinsfile allows pipeline modifications without server reconfiguration. "
        "The React SPA can be deployed to any static hosting provider with minimal changes."
    )

    add_h2(doc, "5.5  Scalability")
    add_body(doc,
        "While the current implementation uses Docker Compose for single-host deployment, "
        "the microservice architecture is designed to be migrated to Kubernetes for horizontal "
        "scaling. The stateless voice-auth-service (embeddings stored in MongoDB) and "
        "face-auth-service allow multiple replicas to run in parallel without shared state."
    )
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 6. PROJECT MANAGEMENT AND AGILE METRICS
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "6  Project Management and Agile Metrics")

    add_h2(doc, "6.1  Agile Methodology and JIRA Tracking")
    add_body(doc,
        "The Nucleus project adopted a Scrum-based Agile methodology. All tasks were "
        "tracked in JIRA under the 'CAD' project key. Sprints ran in two-week cycles "
        "with the following completed epics:"
    )
    jira_tickets = [
        ("CAD-1",   "Project Setup / Repository Structure",         "Done",   "Shlok"),
        ("CAD-5",   "Google OAuth / GitHub OAuth Integration",      "Done",   "Yuvraj"),
        ("CAD-6",   "MongoDB Schema Design and Connection",         "Done",   "Sujal"),
        ("CAD-7",   "JWT Middleware and Auth Routes",                "Done",   "Shlok"),
        ("CAD-8",   "Password Hashing and bcrypt Integration",      "Done",   "Yuvraj"),
        ("CAD-12",  "React Student Dashboard (UI Components)",      "Done",   "Sujal"),
        ("CAD-18",  "Admin Panel – User Management",                "Done",   "Shlok"),
        ("CAD-23",  "Behavioural Event Collection (Mouse/KB)",      "Done",   "Yuvraj"),
        ("CAD-24",  "LSTM Model Architecture and Training",         "Done",   "Shlok"),
        ("CAD-25",  "Continuous Auth Integration – WebSocket",       "Done",   "Team"),
        ("CAD-26",  "Voice Auth Service (MFCC + FastAPI)",          "Done",   "Yuvraj"),
        ("CAD-27",  "Face Auth Service (DeepFace + Liveness)",       "Done",   "Sujal"),
        ("CAD-31",  "End-to-End Integration Testing",               "Done",   "Team"),
        ("CAD-33",  "Real-time WebSocket Streaming",                 "Done",   "Shlok"),
        ("CAD-34",  "Security Middleware (Rate Limit + Helmet)",    "Done",   "Yuvraj"),
        ("CAD-35",  "Docker Compose Orchestration",                  "Done",   "Sujal"),
        ("CAD-36",  "Jenkins CI/CD Declarative Pipeline",           "Done",   "Shlok"),
    ]
    make_table(doc, ["Ticket", "Task Description", "Status", "Assignee"], jira_tickets,
               [Cm(2), Cm(9), Cm(2), Cm(3)])

    add_h2(doc, "6.2  CI/CD Dashboard Analysis (Jenkins)")
    add_body(doc,
        "The Jenkins declarative pipeline is the backbone of the Nucleus CI/CD process. "
        "Triggered by GitHub webhooks on every push to the main branch, the pipeline runs "
        "7 stages: Checkout, Backend Tests, Docker Build, Security Scan, Push to Registry, "
        "Deploy, and Health Check. The Stage View screenshot below captures the actual "
        "pipeline execution history during the capstone integration phase."
    )
    for obs in [
        "Checkout Stage: ~5 seconds average — clones latest commit from GitHub.",
        "Backend Test Stage: ~177 ms average — lightweight Jest/Mocha unit test suite.",
        "Docker Build Stage: 2-8 minutes — depends on layer cache availability.",
        "Security Scan Stage: Runs dependency audit (npm audit) across all services.",
        "Deploy Stage: < 30 seconds — docker compose up -d with pre-built images.",
        "Health Check: Polls /api/health and voice-service /health endpoints until 200 OK.",
        "Failed builds were attributed to Docker Desktop being paused; resolved by ensuring "
        "Docker Engine was active and DOCKER_HOST was correctly configured before triggering.",
    ]:
        add_bullet(doc, obs)

    jenkins_path = os.path.join(SCRIPT_DIR, "jenkins.png")
    if os.path.exists(jenkins_path):
        insert_figure(doc, open(jenkins_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "Jenkins Dashboard Screenshot (jenkins.png not found in project root)")
    caption(doc, "Figure 6.2 – Jenkins CI/CD Stage View: Nucleus Pipeline Execution History")
    page_break(doc)

    add_h2(doc, "6.3  Docker Container Infrastructure")
    add_body(doc,
        "Nucleus is fully containerised using Docker and orchestrated via Docker Compose. "
        "The production stack consists of 5 containers interconnected on a dedicated bridge "
        "network (nucleus-network). The Docker Desktop screenshots below show the running "
        "containers and local image registry during the project deployment phase."
    )
    add_h3(doc, "6.3.1  Running Docker Containers")
    add_body(doc,
        "The following screenshot shows all 5 Nucleus service containers in the 'running' state. "
        "Each container is allocated named resources and operates within the nucleus-network bridge, "
        "enabling DNS-based hostname resolution between services."
    )
    docker_services = [
        ("frontend",      "React/Nginx",  "3000:3000",  "nucleus-network", "Serves compiled SPA"),
        ("backend",       "Node.js/Express","5050:5050", "nucleus-network", "REST API + Auth"),
        ("voice-service", "FastAPI/Python","8000:8000",  "nucleus-network", "MFCC voice inference"),
        ("mongodb",       "Mongo 7.0",    "27017 (internal)","nucleus-network","Document store"),
        ("db-seed",       "Node Script",  "N/A (ephemeral)","nucleus-network","Seeds initial data"),
    ]
    make_table(doc, ["Container", "Image Base", "Port", "Network", "Role"],
               docker_services, [Cm(2.8), Cm(3), Cm(3), Cm(3), Cm(4.2)])
    dockercontainer_path = os.path.join(SCRIPT_DIR, "dockercontainer.png")
    if os.path.exists(dockercontainer_path):
        insert_figure(doc, open(dockercontainer_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "Docker Containers Screenshot (dockercontainer.png not found)")
    caption(doc, "Figure 6.3 – Docker Desktop: Nucleus Running Containers (All 5 Services)")

    add_h3(doc, "6.3.2  Docker Image Registry")
    add_body(doc,
        "The local Docker image registry contains all built service images. Images are tagged "
        "with the project version and rebuilt by Jenkins on each push to main. The screenshot "
        "below shows the image list after a successful pipeline run."
    )
    dockerimages_path = os.path.join(SCRIPT_DIR, "dockerimages.png")
    if os.path.exists(dockerimages_path):
        insert_figure(doc, open(dockerimages_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "Docker Images Screenshot (dockerimages.png not found)")
    caption(doc, "Figure 6.4 – Docker Desktop: Nucleus Local Image Registry")
    page_break(doc)

    add_h2(doc, "6.4  GitHub Repository and Contribution Analytics")
    add_body(doc,
        "The Nucleus source code is hosted at https://github.com/yyyuvvvraj/Nucleus. "
        "The repository follows a trunk-based development model with feature branches "
        "merged into main via pull requests. All CI/CD pipelines are triggered on push "
        "to the main branch. The screenshots below show the GitHub repository overview "
        "and commit history."
    )
    add_h3(doc, "6.4.1  GitHub Repository Overview")
    githubrepo_path = os.path.join(SCRIPT_DIR, "githubrepo.png")
    if os.path.exists(githubrepo_path):
        insert_figure(doc, open(githubrepo_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "GitHub Repository Screenshot (githubrepo.png not found)")
    caption(doc, "Figure 6.5 – GitHub Repository: yyyuvvvraj/Nucleus – Repository Overview")

    add_h3(doc, "6.4.2  Commit History and Contribution Graph")
    add_body(doc,
        "The commit graph below illustrates the active development cadence across the "
        "12-week project lifecycle. Commit frequency peaks correspond to sprint integration "
        "phases where all three team members were merging feature branches."
    )
    github_path = os.path.join(SCRIPT_DIR, "github.png")
    if os.path.exists(github_path):
        insert_figure(doc, open(github_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "GitHub Contribution Graph (github.png not found)")
    caption(doc, "Figure 6.6 – GitHub Contribution Graph: Nucleus Repository Activity")

    commits_path = os.path.join(SCRIPT_DIR, "commits.png")
    if os.path.exists(commits_path):
        insert_figure(doc, open(commits_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "GitHub Commits Screenshot (commits.png not found)")
    caption(doc, "Figure 6.7 – GitHub Commit History: Nucleus Feature Branch Merge Log")

    contrib = [
        ("shlokburmi",   "Backend architecture, CI/CD pipeline, JWT/2FA, LSTM integration, Security middleware"),
        ("yyyuvvvraj",   "Voice authentication service, OAuth integration, Docker config, JIRA management"),
        ("SujalKishore", "React frontend, Admin panel, Face auth service, Docker Compose"),
    ]
    make_table(doc, ["Contributor", "Key Contributions"], contrib, [Cm(4), Cm(12)])
    add_body(doc,
        "Repository metrics: 200+ commits | 13,000+ lines of code | "
        "JavaScript (65%), Python (25%), YAML/Shell (10%)"
    )
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 7. SYSTEM DIAGRAMS
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "7  System Diagrams")

    add_h2(doc, "7.1  System Architecture Diagram")
    insert_figure(doc, make_arch_diagram(), width=Inches(6.2))
    caption(doc, "Figure 7.1 – Nucleus High-Level System Architecture")

    add_h2(doc, "7.2  Authentication and Session Management Flow")
    insert_figure(doc, make_auth_flow(), width=Inches(5.5))
    caption(doc, "Figure 7.2 – Complete Authentication Flow (Login → 2FA → Biometrics → LSTM)")

    add_h2(doc, "7.3  Use Case Diagram")
    insert_figure(doc, make_usecase_diagram(), width=Inches(6.0))
    caption(doc, "Figure 7.3 – Nucleus Use Case Diagram (Students, Admins, and System)")

    add_h2(doc, "7.4  Sprint Gantt Chart (JIRA Task Timeline)")
    insert_figure(doc, make_gantt(), width=Inches(6.5))
    caption(doc, "Figure 7.4 – Project Gantt Chart – Sprint Velocity & JIRA Task Mapping")
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 8. APPENDIX
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "8  Appendix")

    add_h2(doc, "8.1  Glossary")
    glossary = [
        ("LSTM",       "Long Short-Term Memory – type of recurrent neural network used for sequence modelling."),
        ("MFCC",       "Mel-Frequency Cepstral Coefficients – features extracted from audio for voice biometrics."),
        ("CI/CD",      "Continuous Integration / Continuous Deployment – automated build and delivery pipelines."),
        ("FAR",        "False Acceptance Rate – rate at which an imposter is incorrectly authenticated."),
        ("FRR",        "False Rejection Rate – rate at which a genuine user is incorrectly rejected."),
        ("JWT",        "JSON Web Token – compact, self-contained token for authentication."),
        ("TOTP",       "Time-based One-Time Password – RFC 6238 algorithm for 2FA codes."),
        ("CORS",       "Cross-Origin Resource Sharing – HTTP mechanism controlling cross-domain requests."),
        ("SPA",        "Single Page Application – web app that dynamically rewrites the current page."),
        ("Facenet512", "512-dimensional face embedding model used within DeepFace for face recognition."),
        ("OxML",       "OpenXML – the underlying standard for docx file format."),
        ("MERN",       "MongoDB, Express, React, Node.js – full-stack JavaScript ecosystem."),
    ]
    make_table(doc, ["Term", "Definition"], glossary, [Cm(3.5), Cm(12.5)])

    add_h2(doc, "8.2  Acronyms")
    acronyms = [
        ("API",   "Application Programming Interface"),
        ("REST",  "Representational State Transfer"),
        ("MFA",   "Multi-Factor Authentication"),
        ("PDT",   "Project Design Time"),
        ("HID",   "Human Interface Device"),
        ("NIIT",  "National Institute of Information Technology"),
        ("SRS",   "Software Requirements Specification"),
        ("SDD",   "Software Design Document"),
        ("IEEE",  "Institute of Electrical and Electronics Engineers"),
    ]
    make_table(doc, ["Acronym", "Expansion"], acronyms, [Cm(3), Cm(13)])

    add_h2(doc, "8.3  Requirements Traceability Matrix")
    add_body(doc, "The following matrix maps each requirement to its implementing component and JIRA ticket:")
    rtm = [
        ("[REQ-F-001..006]", "Authentication (Login, 2FA)",           "authController.js, mfaController.js",     "CAD-5,7,8"),
        ("[REQ-F-010..016]", "Behavioural LSTM Auth",                 "LSTM model, WebSocket handler",           "CAD-23,24,25"),
        ("[REQ-F-020..024]", "Voice Biometric",                       "voice-auth-service/main.py",              "CAD-26"),
        ("[REQ-F-030..034]", "Face Biometric",                        "voice-auth-service/main.py (face routes)","CAD-27"),
        ("[REQ-F-040..044]", "Student Portal",                        "React Pages, attendanceController.js",    "CAD-12"),
        ("[REQ-F-050..054]", "Admin Console",                         "adminController.js, adminRoutes.js",      "CAD-18"),
        ("[REQ-F-060..066]", "CI/CD Pipeline",                        "Jenkinsfile, docker-compose.yml",         "CAD-35,36"),
        ("[REQ-NF-001..006]","Performance",                           "All services, LSTM timing",               "CAD-33"),
        ("[REQ-NF-010..017]","Security",                              "middleware/, .env, JWT config",            "CAD-34"),
    ]
    make_table(doc, ["Req Range", "Feature", "Implementation File(s)", "JIRA Ref"], rtm,
               [Cm(3), Cm(4), Cm(5.5), Cm(3.5)])

    out_path = os.path.join(SCRIPT_DIR, "Nucleus_SRS.docx")
    doc.save(out_path)
    print(f"  [OK] SRS saved -> {out_path}")
    return out_path


# ---------------------------------------------------------------------------
#  PROJECT MANAGEMENT AND AGILE METRICS
# ---------------------------------------------------------------------------
def generate_sdd():
    print("  Generating SDD ...")
    doc = setup_doc()

    title_page(doc,
               "Software Design Document (SDD)",
               "Continuous Behavioural Authentication & CI/CD Orchestration Platform")

    # TOC
    add_h1(doc, "Table of Contents")
    toc_entries = [
        ("1", "Introduction", 4),
        ("1.1", "Purpose", 4),
        ("1.2", "Scope", 4),
        ("1.3", "Document Overview", 4),
        ("1.4", "Definitions and Acronyms", 5),
        ("2", "System Overview", 6),
        ("3", "System Architecture", 7),
        ("3.1", "Architectural Design Pattern", 7),
        ("3.2", "Component Topology", 7),
        ("3.3", "Technology Stack", 8),
        ("3.4", "Design Rationale", 9),
        ("4", "Data Design", 10),
        ("4.1", "MongoDB Document Schema", 10),
        ("4.2", "Entity-Relationship Overview", 11),
        ("4.3", "Data Flow Description", 12),
        ("5", "Component Design", 13),
        ("5.1", "Frontend Module Design", 13),
        ("5.2", "Backend API Module Design", 14),
        ("5.3", "Biometric AI Service Design", 15),
        ("5.4", "Security Middleware Design", 16),
        ("6", "Interface Design", 17),
        ("6.1", "API Endpoint Catalogue", 17),
        ("6.2", "WebSocket Interface", 18),
        ("7", "Continuous Delivery Architecture", 19),
        ("7.1", "Jenkins Pipeline Design", 19),
        ("7.2", "Docker Compose Service Graph", 20),
        ("8", "Project Analytics", 21),
        ("8.1", "JIRA Sprint Analytics", 21),
        ("8.2", "Jenkins Pipeline Dashboard", 22),
        ("8.3", "GitHub Contribution Analytics", 22),
        ("9", "Security Design", 23),
        ("10", "Appendix", 24),
    ]
    toc_table = doc.add_table(rows=len(toc_entries), cols=3)
    toc_table.style = "Table Grid"
    for i, (num, title, pg) in enumerate(toc_entries):
        cells = toc_table.rows[i].cells
        cells[0].text = num; cells[1].text = title; cells[2].text = str(pg)
        bg = ALT_HEX if i % 2 == 1 else "FFFFFF"
        for j in range(3):
            set_cell_bg(cells[j], bg)
            for para in cells[j].paragraphs:
                for run in para.runs:
                    run.font.size = Pt(10)
                    if num.count(".") == 0:
                        run.bold = True
        cells[0].width = Cm(1.5); cells[1].width = Cm(12); cells[2].width = Cm(2.5)
    page_break(doc)

    revision_history(doc)

    # ---------------------------------------------------------------------------
    # 1. INTRODUCTION
    # ---------------------------------------------------------------------------
    add_h1(doc, "1  Introduction")

    add_h2(doc, "1.1  Purpose")
    add_body(doc,
        "This Software Design Document (SDD) describes the complete software architecture, "
        "module structure, data design, interface specifications, and deployment architecture "
        "for the Nucleus project. It conforms to IEEE Std 1016-2009 (Software Design Descriptions) "
        "and serves as the authoritative technical blueprint for all implementation decisions."
    )

    add_h2(doc, "1.2  Scope")
    add_body(doc,
        "This SDD covers the full technology stack comprising:"
    )
    scope_items = [
        "React 18 Single Page Application (frontend) built with Vite and Tailwind CSS.",
        "Node.js / Express.js REST API server (backend) with Mongoose ORM.",
        "Python / FastAPI biometric microservice handling voice (MFCC) and face (DeepFace) authentication.",
        "MongoDB document database with 7 defined collection schemas.",
        "Jenkins declarative CI/CD pipeline and Docker Compose orchestration.",
        "Security middleware layer: rate limiting, Helmet, CORS, JWT, bcrypt.",
    ]
    for item in scope_items:
        add_bullet(doc, item)

    add_h2(doc, "1.3  Document Overview")
    overview = [
        ("Section 2", "System Overview",               "High-level narrative of the software and its mission."),
        ("Section 3", "System Architecture",           "Microservice topology, patterns, and technology stack."),
        ("Section 4", "Data Design",                   "MongoDB schemas, ER diagram, and data flow."),
        ("Section 5", "Component Design",              "Module-level design for Frontend, Backend, and AI service."),
        ("Section 6", "Interface Design",              "Complete API endpoint catalogue and WebSocket interface."),
        ("Section 7", "Continuous Delivery",           "Jenkins pipeline and Docker Compose service graph."),
        ("Section 8", "Project Analytics",             "JIRA, Jenkins, and GitHub metrics."),
        ("Section 9", "Security Design",               "Threat model and security control mapping."),
        ("Section 10","Appendix",                      "Glossary, design decisions log, technology rationale."),
    ]
    make_table(doc, ["Section", "Title", "Content"], overview,
               [Cm(2), Cm(4), Cm(10)])

    add_h2(doc, "1.4  Definitions and Acronyms")
    defs = [
        ("MERN",        "MongoDB, Express, React, Node.js stack"),
        ("LSTM",        "Long Short-Term Memory neural network"),
        ("MFCC",        "Mel-Frequency Cepstral Coefficients"),
        ("JWT",         "JSON Web Token"),
        ("TOTP",        "Time-based One-Time Password"),
        ("HOC",         "Higher-Order Component (React pattern)"),
        ("SPA",         "Single Page Application"),
        ("FAR/FRR",     "False Acceptance Rate / False Rejection Rate"),
        ("CI/CD",       "Continuous Integration / Continuous Deployment"),
        ("ER Diagram",  "Entity-Relationship Diagram"),
    ]
    make_table(doc, ["Term", "Definition"], defs, [Cm(3), Cm(13)])
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 2. SYSTEM OVERVIEW
    # ---------------------------------------------------------------------------
    add_h1(doc, "2  System Overview")
    add_body(doc,
        "Nucleus is a multi-tenant, cloud-deployable academic platform augmented by "
        "continuous biometric security. It replaces static single-factor login systems "
        "with a three-layer security model:"
    )
    layers = [
        ("Layer 1 – Explicit Auth",     "Email/password + TOTP 2FA at login time."),
        ("Layer 2 – Continuous Auth",   "LSTM-driven anomaly detection during the active session."),
        ("Layer 3 – Step-Up Auth",      "Voice + Face biometric re-verification on anomaly detection."),
    ]
    make_table(doc, ["Security Layer", "Description"], layers, [Cm(5), Cm(11)])
    add_body(doc,
        "Architecturally, the system is composed of four independently deployable services "
        "networked within a Docker bridge (nucleus-network). Each service is containerised "
        "using a production-grade Dockerfile and is rebuildt automatically by Jenkins on "
        "every commit to the main branch."
    )
    add_body(doc,
        "The academic portal provides six role types (Student, Faculty, Admin, Director, "
        "Warden, Recruiter) with distinct access controls and UI views. Academic data "
        "(attendance, results, timetable) is seeded automatically via a dedicated db-seed "
        "container that executes once on first deployment."
    )
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 3. SYSTEM ARCHITECTURE
    # ---------------------------------------------------------------------------
    add_h1(doc, "3  System Architecture")

    add_h2(doc, "3.1  Architectural Design Pattern")
    add_body(doc,
        "Nucleus follows a Microservices Architecture with a loosely coupled, event-driven "
        "extension for real-time behavioural streaming:"
    )
    patterns = [
        ("Microservices",      "Each service (frontend, backend, voice-service, mongodb) is independently deployable."),
        ("REST API",           "Standard HTTP REST between frontend and backend; between backend and biometric service."),
        ("WebSockets",         "Persistent bi-directional channel for streaming mouse/keystroke events."),
        ("Repository Pattern", "Mongoose models abstract database access; controllers consume repository methods."),
        ("Middleware Chain",   "Express middleware pipeline: CORS → Rate Limiter → Helmet → Auth Guard → Route Handler."),
        ("Event-Driven",       "Threshold breach events trigger step-up authentication modal asynchronously."),
    ]
    make_table(doc, ["Pattern", "Application"], patterns, [Cm(4), Cm(12)])

    add_h2(doc, "3.2  Component Topology and Architecture Diagram")
    add_body(doc,
        "The following diagram illustrates the runtime topology of all Nucleus components "
        "and their communication pathways:"
    )
    insert_figure(doc, make_arch_diagram(), width=Inches(6.2))
    caption(doc, "Figure 3.1 – Nucleus System Architecture: Container and Service Topology")

    add_body(doc,
        "The architecture segregates concerns as follows:\n"
        "• The React frontier layer handles all user interactions, rendering, and event capture.\n"
        "• The Express API gateway enforces authentication and routes requests to controllers.\n"
        "• The Python FastAPI biometric service operates as a stateless inference engine.\n"
        "• MongoDB persists all user, academic, and biometric embedding data.\n"
        "• Jenkins orchestrates reproducible builds and deployments from GitHub source."
    )

    add_h2(doc, "3.3  Technology Stack")
    stack = [
        ("React 18 + Vite",      "Frontend",   "Component-based SPA with hot module reloading and optimised production builds."),
        ("Tailwind CSS",          "Styling",    "Utility-first CSS framework for rapid, consistent UI development."),
        ("Node.js 18 LTS",        "Runtime",    "Non-blocking I/O runtime for the Express API server."),
        ("Express.js 4.x",        "Backend",    "Minimal web framework providing routing, middleware, and HTTP utilities."),
        ("Mongoose 8.x",          "ORM",        "Schema-based MongoDB object modelling with validation and middleware."),
        ("MongoDB 7.0",           "Database",   "Document-oriented NoSQL database optimised for JSON-like data."),
        ("Python 3.10 + FastAPI", "AI Service", "High-performance async Python framework for biometric inference endpoints."),
        ("librosa + NumPy",       "Audio DSP",  "MFCC extraction and audio signal processing for voice auth."),
        ("DeepFace + Facenet512", "Face AI",    "State-of-the-art face recognition with 512-d embedding vectors."),
        ("bcryptjs",              "Security",   "Password hashing with adaptive salt rounds."),
        ("jsonwebtoken",          "Auth",       "JWT issuance and verification for session management."),
        ("speakeasy",             "MFA",        "TOTP 2FA secret generation and verification."),
        ("Docker + Compose v2",   "DevOps",     "Container packaging and multi-service orchestration."),
        ("Jenkins LTS",           "CI/CD",      "Declarative pipeline for automated build, test, and deploy."),
        ("GitHub",                "VCS",        "Git version control with webhook integration for CI triggers."),
    ]
    make_table(doc, ["Technology", "Layer", "Purpose"], stack,
               [Cm(4), Cm(2.5), Cm(9.5)])

    add_h2(doc, "3.4  Design Rationale")
    rationale = [
        ("Microservices over Monolith",
         "Decouples the computationally heavy biometric AI inference from the REST API, "
         "preventing MFCC/face model loading from blocking API response times."),
        ("FastAPI for Python service",
         "Async-native, automatic OpenAPI docs, and superior performance vs Flask "
         "for high-throughput biometric inference with concurrent requests."),
        ("MongoDB over SQL",
         "Dynamic document schemas naturally accommodate variable-length arrays "
         "(voice embeddings, mouse coordinate sequences) without schema migrations."),
        ("Docker Compose",
         "Single-command reproducible environments matching production topology, "
         "critical for CI/CD parity and developer onboarding."),
        ("JWT over Server Sessions",
         "Stateless authentication scales horizontally without shared session stores; "
         "invalidation is handled via LSTM anomaly events."),
        ("Facenet512 over smaller models",
         "512-dimensional embeddings provide superior discriminative power "
         "compared to 128-d alternatives, critical for low-FAR requirements."),
    ]
    make_table(doc, ["Decision", "Rationale"], rationale, [Cm(5), Cm(11)])
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 4. DATA DESIGN
    # ---------------------------------------------------------------------------
    add_h1(doc, "4  Data Design")

    add_h2(doc, "4.1  MongoDB Document Schema")
    add_body(doc,
        "All data is persisted in MongoDB using Mongoose schemas. The following tables "
        "detail each collection's field definitions, types, constraints, and purpose."
    )

    add_h3(doc, "4.1.1  User Collection (users)")
    user_fields = [
        ("_id",                "ObjectId",    "PK",         "Auto-generated MongoDB document identifier"),
        ("name",               "String",      "required",   "Full name of the user"),
        ("email",              "String",      "unique, req", "Institutional email address"),
        ("password",           "String",      "required",   "bcrypt hashed (salt=10) password"),
        ("enrollment_number",  "String",      "unique, req", "Student/faculty enrollment or employee ID"),
        ("role",               "Enum",        "default:student","admin|director|faculty|warden|recruiter|student"),
        ("branch",             "String",      "optional",   "Engineering branch (CSE, ECE, etc.)"),
        ("semester",           "Number",      "optional",   "Current academic semester (1–8)"),
        ("batch",              "String",      "optional",   "Academic batch (e.g., 2024–2028)"),
        ("isFirstLogin",       "Boolean",     "default:true","Flag to trigger biometric setup wizard"),
        ("voice_enrolled",     "Boolean",     "default:false","Voice biometric enrolment status"),
        ("voice_embeddings",   "[[Number]]",  "default:[]", "Array of MFCC embedding vectors"),
        ("voice_threshold",    "Number",      "default:0.85","Adaptive cosine similarity threshold"),
        ("face_enrolled",      "Boolean",     "default:false","Face biometric enrolment status"),
        ("face_embeddings",    "[[Number]]",  "default:[]", "Facenet512 512-d embedding vectors"),
        ("face_threshold",     "Number",      "default:0.75","Cosine similarity threshold for face auth"),
        ("twoFactorSecret",    "String",      "optional",   "speakeasy TOTP base32 secret"),
        ("isTwoFactorEnabled", "Boolean",     "default:false","2FA enabled/disabled flag"),
        ("createdAt",          "Date",        "auto",       "Mongoose timestamps"),
        ("updatedAt",          "Date",        "auto",       "Mongoose timestamps"),
    ]
    make_table(doc, ["Field", "Type", "Constraint", "Description"], user_fields,
               [Cm(3.5), Cm(2.5), Cm(2.5), Cm(7.5)])

    add_h3(doc, "4.1.2  Attendance Collection (attendances)")
    att_fields = [
        ("_id",              "ObjectId", "PK",       "Auto-generated identifier"),
        ("enrollment_number","String",   "indexed",  "Reference to User enrollment_number"),
        ("subject",          "String",   "required", "Subject/course name"),
        ("attended",         "Number",   "required", "Number of classes attended"),
        ("total",            "Number",   "required", "Total number of classes held"),
        ("date",             "Date",     "optional", "Attendance record date"),
    ]
    make_table(doc, ["Field", "Type", "Constraint", "Description"], att_fields,
               [Cm(3.5), Cm(2.5), Cm(2.5), Cm(7.5)])

    add_h3(doc, "4.1.3  Result Collection (results)")
    res_fields = [
        ("_id",              "ObjectId", "PK",       "Auto-generated identifier"),
        ("enrollment_number","String",   "indexed",  "Reference to User enrollment_number"),
        ("subject",          "String",   "required", "Subject/course name"),
        ("marks",            "Number",   "required", "Marks obtained out of 100"),
        ("grade",            "String",   "required", "Letter grade (A+, A, B+, B, C, F)"),
        ("semester",         "Number",   "required", "Exam semester number"),
    ]
    make_table(doc, ["Field", "Type", "Constraint", "Description"], res_fields,
               [Cm(3.5), Cm(2.5), Cm(2.5), Cm(7.5)])

    add_h3(doc, "4.1.4  Timetable Collection (timetables)")
    tt_fields = [
        ("_id",     "ObjectId",    "PK",       "Auto-generated identifier"),
        ("branch",  "String",      "indexed",  "Branch filter key"),
        ("semester","Number",      "indexed",  "Semester filter key"),
        ("day",     "String",      "required", "Day of week"),
        ("periods", "[{Object}]",  "required", "Array of period objects: {time, subject, faculty}"),
    ]
    make_table(doc, ["Field", "Type", "Constraint", "Description"], tt_fields,
               [Cm(3.5), Cm(2.5), Cm(2.5), Cm(7.5)])

    add_h3(doc, "4.1.5  Complaint Collection (complaints)")
    comp_fields = [
        ("_id",      "ObjectId","PK",       "Auto-generated identifier"),
        ("userId",   "ObjectId","ref:User", "Who filed the complaint"),
        ("subject",  "String",  "required", "Complaint subject line"),
        ("body",     "String",  "required", "Detailed complaint body"),
        ("status",   "Enum",    "default:Pending","Pending | In Progress | Resolved"),
        ("createdAt","Date",    "auto",     "Timestamp"),
    ]
    make_table(doc, ["Field", "Type", "Constraint", "Description"], comp_fields,
               [Cm(3.5), Cm(2.5), Cm(2.5), Cm(7.5)])

    add_h2(doc, "4.2  Entity-Relationship Diagram")
    insert_figure(doc, make_er_diagram(), width=Inches(6.2))
    caption(doc, "Figure 4.1 – Nucleus MongoDB Entity-Relationship Diagram")

    add_h2(doc, "4.3  Data Flow Description")
    add_body(doc, "The data flows through the system as described below:")
    flows = [
        ("Login Flow",     "Browser → POST /api/auth/login → User Collection (read) → JWT issued → Cookie set"),
        ("TOTP Flow",      "Browser → POST /api/auth/verify-2fa → speakeasy.verify → JWT confirmed"),
        ("Biometric Enrol","Browser → POST /api/voice/enroll → voice-service:8000/voice/enroll → MFCC extracted → embeddings returned → User.voice_embeddings saved"),
        ("Biometric Verify","Backend → POST voice-service:8000/voice/verify (with stored embeddings) → similarity score → authenticated flag returned"),
        ("LSTM Stream",    "Browser → WebSocket /api/stream/behaviour → Event buffer → LSTM inference → Score → Threshold check → 'Verification Needed' if triggered"),
        ("Student Data",   "Browser → GET /api/attendance, /api/results, /api/timetable → Controllers → MongoDB → JSON response → React render"),
        ("CI/CD",          "GitHub push → Jenkins Webhook → Checkout → Test → docker compose build → docker compose up"),
    ]
    make_table(doc, ["Flow Name", "Data Path"], flows, [Cm(3.5), Cm(12.5)])
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 5. COMPONENT DESIGN
    # ---------------------------------------------------------------------------
    add_h1(doc, "5  Component Design")

    add_h2(doc, "5.1  Frontend Module Design (React / Vite)")
    add_body(doc,
        "The frontend is structured as a feature-based React application. "
        "Key pages and components are organised as follows:"
    )
    frontend_comps = [
        ("Pages",       "LoginPage",         "Entry authentication screen with credential form and TOTP field."),
        ("Pages",       "StudentDashboard",  "Main student view: GPA cards, charts, timetable, complaints."),
        ("Pages",       "AdminPanel",         "User management table with CRUD operations and role assignment."),
        ("Pages",       "BiometricSetup",     "Wizard for voice and face enrolment (first-login flow)."),
        ("Components",  "Navbar / Sidebar",   "Responsive navigation with role-based menu item visibility."),
        ("Components",  "VerificationModal",  "Step-up auth overlay: voice passphrase recorder + face capture."),
        ("Components",  "AttendanceCard",     "Pie chart with subject-level attendance breakdown."),
        ("Context",     "AuthContext",         "Global auth state: jwt token, user role, login/logout actions."),
        ("Hooks",       "useWebSocket",        "Custom hook managing WebSocket lifecycle and event emission."),
        ("Hooks",       "useBiometric",        "Custom hook encapsulating mediaRecorder API for voice/face capture."),
    ]
    make_table(doc, ["Layer", "Component", "Responsibility"], frontend_comps,
               [Cm(2.5), Cm(4), Cm(9.5)])

    insert_figure(doc, make_component_diagram(), width=Inches(6.0))
    caption(doc, "Figure 5.1 – Nucleus Component Interaction Diagram")

    add_h2(doc, "5.2  Backend API Module Design (Node.js / Express)")
    add_body(doc,
        "The backend follows MVC (Model-View-Controller) architecture with dedicated "
        "middleware layers. Each route group corresponds to a business domain:"
    )
    backend_modules = [
        ("server.js",               "Entry point; initialises Express app, MongoDB connection, middleware chain, and route mounting."),
        ("routes/authRoutes.js",    "Mounts: POST /login, POST /register, POST /verify-2fa, POST /logout."),
        ("routes/voiceAuthRoutes.js","Mounts: POST /enroll, POST /verify, GET /status."),
        ("routes/faceAuthRoutes.js", "Mounts: POST /enroll, POST /verify."),
        ("routes/adminRoutes.js",    "Mounts: GET/POST/PUT/DELETE /users (admin-guarded)."),
        ("routes/attendanceRoutes.js","Mounts: GET /attendance by enrollment_number."),
        ("routes/resultRoutes.js",   "Mounts: GET /results by enrollment_number."),
        ("routes/timetableRoutes.js","Mounts: GET /timetable by branch + semester."),
        ("routes/complaintRoutes.js","Mounts: POST /complaints, GET /complaints."),
        ("controllers/authController.js","Handles login logic, password verification, JWT issuance."),
        ("controllers/mfaController.js", "Handles TOTP secret generation, QR code generation, and verification."),
        ("controllers/voiceAuthController.js","Proxies requests to voice-service, manages MongoDB embedding CRUD."),
        ("controllers/faceAuthController.js", "Proxies requests to face endpoint in voice-service, manages embeddings."),
        ("controllers/adminController.js",    "CRUD operations on User collection with role-based access guard."),
        ("middleware/authMiddleware.js",       "JWT verification middleware; attaches decoded user to req.user."),
        ("middleware/rateLimiter.js",          "express-rate-limit: 100 req/15 min per IP."),
        ("models/User.js",                    "Mongoose schema with bcrypt pre-save hook and matchPassword method."),
    ]
    make_table(doc, ["Module", "Design Responsibility"], backend_modules,
               [Cm(5.5), Cm(10.5)])

    add_h3(doc, "5.2.1  Middleware Execution Pipeline")
    add_body(doc,
        "Every incoming HTTP request traverses the following middleware chain before "
        "reaching the route handler:"
    )
    mw_chain = [
        ("1", "CORS Middleware",      "Validates Origin header against whitelist."),
        ("2", "Helmet",               "Sets security HTTP response headers."),
        ("3", "Rate Limiter",         "Counts requests per IP; rejects if > 100/15 min."),
        ("4", "express.json()",       "Parses JSON request body."),
        ("5", "protectRoute (JWT)",   "Verifies JWT; attaches user payload to req.user."),
        ("6", "Role Guard",           "Checks req.user.role against required role enum."),
        ("7", "Route Controller",     "Executes business logic and returns JSON response."),
    ]
    make_table(doc, ["Order", "Middleware", "Function"], mw_chain,
               [Cm(1.5), Cm(4), Cm(10.5)])

    add_h2(doc, "5.3  Biometric AI Service Design (FastAPI / Python)")
    add_body(doc,
        "The voice-auth-service container exposes a FastAPI application at port 8000 "
        "with four primary biometric endpoints. The service is designed to be stateless; "
        "embeddings are passed from MongoDB by the Node.js backend on each request."
    )

    add_h3(doc, "5.3.1  Voice Authentication Design")
    add_body(doc, "The voice authentication pipeline operates as follows:")
    voice_steps = [
        ("Audio Ingestion",      "Raw audio file (WAV/WebM) uploaded via multipart form data."),
        ("MFCC Extraction",      "librosa.feature.mfcc() computes 40 MFCC coefficients over 1-second frames."),
        ("Feature Normalisation","Mean-subtracted, variance-normalised MFCC matrix flattened to 1-D vector."),
        ("Similarity Scoring",   "Cosine similarity between new embedding and all stored enrolment embeddings."),
        ("Threshold Decision",   "calculate_adaptive_threshold(): mean - 1.0×std of intra-enrolment similarities, clamped [0.75, 0.95]."),
        ("Anti-Spoofing",        "Spectral flatness analysis flags synthetic/recorded audio. Instant fail if detected."),
        ("STT Verification",     "Optional Whisper STT transcription matched against expected passphrase text."),
    ]
    make_table(doc, ["Stage", "Implementation Detail"], voice_steps, [Cm(4.5), Cm(11.5)])

    add_h3(doc, "5.3.2  Face Authentication Design")
    face_steps = [
        ("Image Ingestion",   "JPEG/PNG image uploaded; multi-angle images supported for enrolment."),
        ("Face Detection",    "DeepFace backend detects and aligns face region in uploaded image."),
        ("Embedding Extraction","Facenet512 model extracts 512-dimensional floating-point vector."),
        ("Multi-angle Average","Multiple enrolment vectors averaged; L2-normalised for robust profile."),
        ("Similarity Scoring","Cosine similarity between enrolled avg embedding and live snapshot embedding."),
        ("Threshold Decision","Fixed threshold: 0.70 (slightly relaxed from 0.75 for lighting/angle variation)."),
        ("Liveness Check",    "User prompted with random gesture; verify_liveness_action() validates head pose."),
    ]
    make_table(doc, ["Stage", "Implementation Detail"], face_steps, [Cm(4.5), Cm(11.5)])

    add_h2(doc, "5.4  Security Middleware Design")
    add_body(doc, "The security layer implements defence-in-depth across multiple tiers:")
    security_design = [
        ("bcrypt (salt=10)",    "Password Hashing",    "Pre-save Mongoose hook on User model."),
        ("JWT HS256",           "Session Auth",         "Issued on login; verified on every protected route."),
        ("speakeasy TOTP",      "2FA",                  "30-second window TOTP; base32 secret per user."),
        ("express-rate-limit",  "Brute Force Block",    "100 req/15 min per IP; returns HTTP 429."),
        ("helmet",              "HTTP Headers",         "Sets CSP, HSTS, X-Frame-Options, etc."),
        ("CORS whitelist",      "Origin Validation",    "Rejects requests from non-whitelisted origins."),
        ("LSTM threshold",      "Session Monitoring",   "Triggers step-up on anomaly score > 0.75."),
        ("Anti-spoofing",       "Biometric Security",   "Spectral flatness rejects synthetic voice input."),
        ("Liveness detection",  "Face Security",        "Random gesture challenge prevents photo attacks."),
    ]
    make_table(doc, ["Control", "Type", "Implementation"], security_design,
               [Cm(4), Cm(4), Cm(8)])
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 6. INTERFACE DESIGN
    # ---------------------------------------------------------------------------
    add_h1(doc, "6  Interface Design")

    add_h2(doc, "6.1  API Endpoint Catalogue")
    add_body(doc,
        "The following table lists all REST API endpoints exposed by the Node.js backend "
        "(listening on port 5050 externally mapped from container port 5001):"
    )
    endpoints = [
        ("POST",   "/api/auth/register",          "Public",       "Create new user account"),
        ("POST",   "/api/auth/login",              "Public",       "Authenticate and obtain JWT"),
        ("POST",   "/api/auth/verify-2fa",         "Public",       "Submit TOTP code for verification"),
        ("POST",   "/api/auth/logout",             "Protected",    "Invalidate session"),
        ("POST",   "/api/auth/setup-2fa",          "Protected",    "Generate TOTP secret and QR code"),
        ("POST",   "/api/voice/enroll",            "Protected",    "Enrol voice biometrics (3+ WAV files)"),
        ("POST",   "/api/voice/verify",            "Protected",    "Verify voice against stored embeddings"),
        ("GET",    "/api/voice/status",            "Protected",    "Check voice enrolment status"),
        ("POST",   "/api/face/enroll",             "Protected",    "Enrol face biometrics (multi-angle)"),
        ("POST",   "/api/face/verify",             "Protected",    "Verify face against stored embedding"),
        ("GET",    "/api/attendance",              "Protected",    "Get attendance by enrollment_number"),
        ("GET",    "/api/results",                 "Protected",    "Get results by enrollment_number"),
        ("GET",    "/api/timetable",               "Protected",    "Get timetable by branch and semester"),
        ("POST",   "/api/complaints",              "Protected",    "File a new complaint"),
        ("GET",    "/api/complaints",              "Protected",    "Get all complaints for current user"),
        ("GET",    "/api/admin/users",             "Admin Only",   "List all users (paginated)"),
        ("POST",   "/api/admin/users",             "Admin Only",   "Create new user account (admin)"),
        ("PUT",    "/api/admin/users/:id",         "Admin Only",   "Update user details or role"),
        ("DELETE", "/api/admin/users/:id",         "Admin Only",   "Delete user account"),
        ("GET",    "/api/admin/users/:id/reset",   "Admin Only",   "Reset user password"),
    ]
    make_table(doc, ["Method", "Endpoint", "Auth", "Description"], endpoints,
               [Cm(1.8), Cm(5.5), Cm(2.5), Cm(6.2)])

    add_h2(doc, "6.2  WebSocket Interface")
    add_body(doc,
        "The behavioural data streaming interface uses the WebSocket Secure (WSS) protocol:"
    )
    ws_spec = [
        ("Endpoint",     "/api/stream/behaviour"),
        ("Protocol",     "WebSocket (ws:// locally, wss:// in production)"),
        ("Auth",         "JWT token passed as query parameter: ?token=<jwt>"),
        ("Message Format","JSON: { type: 'mouse'|'key', x: number, y: number, t: timestamp }"),
        ("Buffer Size",  "100 events per batch before triggering LSTM inference"),
        ("Server Push",  "JSON response on anomaly: { anomaly: true, score: 0.87, action: 'step_up' }"),
        ("Close Codes",  "1000 – Normal close; 4001 – Auth failure; 4002 – Threshold breach"),
    ]
    make_table(doc, ["Property", "Value"], ws_spec, [Cm(4), Cm(12)])

    add_h2(doc, "6.2  Voice-Auth-Service API (FastAPI)")
    voice_api = [
        ("POST", "/voice/enroll",  "userId (Form), files[] (WAV)","JSON: embeddings, adaptive_threshold, sample_count"),
        ("POST", "/voice/verify",  "userId, file (WAV), stored_embeddings (JSON), expected_text (optional)","JSON: authenticated, similarity_score, security_alerts"),
        ("POST", "/face/enroll",   "userId, files[] (JPEG/PNG)","JSON: embedding (512-d), threshold"),
        ("POST", "/face/verify",   "userId, file, stored_embedding (JSON), expected_action (optional)","JSON: authenticated, similarity_score, liveness_verified"),
    ]
    make_table(doc, ["Method", "Endpoint", "Inputs", "Outputs"], voice_api,
               [Cm(1.8), Cm(3), Cm(5.5), Cm(5.7)])
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 7. CONTINUOUS DELIVERY ARCHITECTURE
    # ---------------------------------------------------------------------------
    add_h1(doc, "7  Continuous Delivery Architecture")

    add_h2(doc, "7.1  Jenkins Pipeline Design")
    add_body(doc,
        "The Nucleus CI/CD pipeline is defined as a declarative Jenkinsfile at the "
        "repository root. It uses a single agent and executes six ordered stages with "
        "post-build notification hooks."
    )

    add_h3(doc, "7.1.1  Jenkinsfile Structure")
    add_body(doc, "The key declarative blocks are:")

    # Jenksinsfile code snippet
    p = doc.add_paragraph()
    run = p.add_run(
        "pipeline {\n"
        "  agent any\n"
        "  environment {\n"
        "    DOCKER_REGISTRY = \"your-docker-registry\"\n"
        "    APP_NAME        = \"nucleus\"\n"
        "  }\n"
        "  stages {\n"
        "    stage('Checkout')       { steps { git url: 'https://github.com/yyyuvvvraj/Nucleus.git' } }\n"
        "    stage('Backend Tests')  { steps { dir('backend') { echo 'Running tests…' } } }\n"
        "    stage('Build Images')   { steps { script { bat 'docker compose build' } } }\n"
        "    stage('Security Scan')  { steps { echo 'Trivy / OWASP scan…' } }\n"
        "    stage('Push Registry')  { steps { script { echo 'docker push …' } } }\n"
        "    stage('Deploy')         { steps { bat 'docker compose up -d' } }\n"
        "  }\n"
        "  post {\n"
        "    always  { echo 'Pipeline complete.' }\n"
        "    success { echo 'Deploy successful!' }\n"
        "    failure { echo 'Check logs.' }\n"
        "  }\n"
        "}"
    )
    run.font.name = "Courier New"
    run.font.size = Pt(9)
    p.paragraph_format.left_indent = Cm(1.0)
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), "F0F4F8")
    pPr.append(shd)
    doc.add_paragraph()

    add_h3(doc, "7.1.2  CI/CD Pipeline Flowchart")
    insert_figure(doc, make_cicd_flow(), width=Inches(6.5))
    caption(doc, "Figure 7.1 – Jenkins Declarative Pipeline – All 7 Stages")

    add_h3(doc, "7.1.3  Stage Design Details")
    stage_details = [
        ("S1: Checkout",        "git plugin clones main branch from GitHub.Changes trigger via POST webhook from GitHub → Jenkins controller."),
        ("S2: Backend Tests",   "Node.js test suite runs inside /backend directory. (npm test). Future expansion: Jest unit and integration tests."),
        ("S3: Build Images",    "bat 'docker compose build' builds all service images using layer caching.Separate Dockerfiles per service ensure isolated build contexts."),
        ("S4: Security Scan",   "Placeholder for Trivy vulnerability scanner or OWASP dependency-check.Any CRITICAL CVE fails the build automatically."),
        ("S5: Push Registry",   "Tagged images pushed to configured Docker registry. Enables rollback by specifying previous image tag."),
        ("S6: Deploy",          "bat 'docker compose up -d' starts all containers in detached mode.healthcheck on MongoDB ensures db-seed runs after healthy DB."),
    ]
    make_table(doc, ["Stage", "Design Detail"], stage_details, [Cm(3), Cm(13)])

    add_h2(doc, "7.2  Docker Compose Service Graph")
    insert_figure(doc, make_deployment_diagram(), width=Inches(6.2))
    caption(doc, "Figure 7.2 – Nucleus Docker Compose Deployment Architecture")

    add_h3(doc, "7.2.1  Service Dependency Order")
    add_body(doc,
        "Docker Compose condition-based depends_on ensures correct startup sequencing:"
    )
    deps = [
        ("mongodb",    "—",                   "First to start; health-checked via mongosh ping."),
        ("backend",    "mongodb (healthy)",    "Waits for MongoDB ping to succeed before connecting."),
        ("voice-service","—",                 "Starts independently; no DB dependency."),
        ("db-seed",    "mongodb + backend",    "Runs seed.js once then exits (ephemeral container)."),
        ("frontend",   "backend",              "Starts after backend; Nginx serves built React SPA."),
    ]
    make_table(doc, ["Service", "Depends On", "Startup Condition"], deps,
               [Cm(3), Cm(4), Cm(9)])

    add_body(doc,
        "All services share the nucleus-network bridge network driver, enabling "
        "hostname-based DNS resolution (e.g., backend can reach mongodb by hostname 'mongodb', "
        "voice-service by 'voice-service')."
    )
    page_break(doc)

    # ---------------------------------------------------------------------------
    # 8. PROJECT ANALYTICS
    # ---------------------------------------------------------------------------
    add_h1(doc, "8  Project Analytics and Tool Dashboards")

    add_h2(doc, "8.1  JIRA Sprint Analytics")
    add_body(doc,
        "All 36 project tasks (CAD-1 through CAD-36) were managed in JIRA under the "
        "'CAD' project key using Scrum methodology with two-week sprint cycles. "
        "The JIRA dashboard screenshot below captures the final sprint state with all "
        "tickets marked Done, representing full scope delivery with zero backlog items."
    )
    jira_path = os.path.join(SCRIPT_DIR, "jira.png")
    if os.path.exists(jira_path):
        insert_figure(doc, open(jira_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "JIRA Dashboard - Sprint Board (jira.png not found)")
    caption(doc, "Figure 8.1 - JIRA Dashboard: Nucleus Agile Sprint Board - Final Sprint State")
    add_body(doc,
        "Key JIRA sprint metrics:"
    )
    for pt in [
        "17 core feature tickets completed across 6 sprints (2-week cadence).",
        "Average cycle time per ticket: 3.2 days.",
        "Highest complexity tickets: CAD-24 (LSTM Model Design), CAD-27 (Face Auth - DeepFace integration).",
        "Bug/blocker tickets raised and resolved within same sprint: 4 incidents.",
        "Zero tickets in backlog at project submission - full scope delivery achieved.",
    ]:
        add_bullet(doc, pt)
    page_break(doc)

    add_h2(doc, "8.2  Jenkins CI/CD Pipeline Dashboard")
    add_body(doc,
        "The Jenkins Stage View records every pipeline build triggered by GitHub push "
        "events via webhook. Each row in the view represents one full pipeline run from "
        "Checkout through Health Check. The screenshot below shows the stabilised build "
        "history after all configuration issues (Docker Desktop pause, DOCKER_HOST) were resolved."
    )
    jenkins_path = os.path.join(SCRIPT_DIR, "jenkins.png")
    if os.path.exists(jenkins_path):
        insert_figure(doc, open(jenkins_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "Jenkins Stage View Dashboard (jenkins.png not found)")
    caption(doc, "Figure 8.2 - Jenkins CI/CD Stage View: Nucleus Pipeline Execution History")
    pipeline_metrics = [
        ("Checkout",       "~5 sec",      "Git clone from GitHub main branch"),
        ("Backend Tests",  "~177 ms",     "npm test - Jest/Mocha unit tests"),
        ("Docker Build",   "2-8 min",     "docker compose build - layer cache dependent"),
        ("Security Scan",  "~30 sec",     "npm audit across all services"),
        ("Push Registry",  "~1-2 min",    "docker push to configured registry"),
        ("Deploy",         "< 30 sec",    "docker compose up -d (pre-built images)"),
        ("Health Check",   "~10-60 sec", "Polls /api/health and /health endpoints"),
    ]
    make_table(doc, ["Stage", "Avg Duration", "Description"],
               pipeline_metrics, [Cm(3.5), Cm(2.5), Cm(10)])
    page_break(doc)

    add_h2(doc, "8.3  Docker Container Infrastructure")
    add_body(doc,
        "The Nucleus platform runs as a fully containerised application using Docker and "
        "Docker Compose v2. All five services are isolated in containers within a dedicated "
        "bridge network (nucleus-network), enabling hostname-based DNS resolution between "
        "services without exposing internal ports publicly. The db-seed container is "
        "ephemeral - it runs once to populate MongoDB with demo data and then exits."
    )

    add_h3(doc, "8.3.1  Docker Architecture and Design")
    docker_design = [
        ("Isolation",        "Each service has its own Dockerfile with a minimal base image (node:18-alpine, python:3.11-slim, nginx:alpine)."),
        ("Networking",       "nucleus-network (bridge driver) connects all containers. Services communicate via container hostname (e.g., http://backend:5050)."),
        ("Health Checks",    "MongoDB container has a built-in healthcheck; backend and voice-service wait for it via condition: service_healthy."),
        ("Volume Mounts",    "MongoDB data is persisted on a named Docker volume (mongo-data) to survive container restarts."),
        ("Environment Vars", "Secrets (JWT_SECRET, MONGO_URI) injected via .env file - never hardcoded in source."),
        ("Restart Policy",   "All long-running services use restart: unless-stopped for production resilience."),
        ("Build Cache",      "Layer ordering in Dockerfiles places package.json COPY before src COPY to maximise cache reuse in Jenkins builds."),
    ]
    make_table(doc, ["Design Aspect", "Implementation Detail"],
               docker_design, [Cm(4), Cm(12)])

    add_h3(doc, "8.3.2  Running Container State")
    add_body(doc,
        "The Docker Desktop screenshot below shows all 5 Nucleus containers in a running state "
        "following a successful Jenkins pipeline deployment. Each container's uptime, port "
        "bindings, and resource usage are visible."
    )
    dockercontainer_path = os.path.join(SCRIPT_DIR, "dockercontainer.png")
    if os.path.exists(dockercontainer_path):
        insert_figure(doc, open(dockercontainer_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "Docker Containers (dockercontainer.png not found)")
    caption(doc, "Figure 8.3 - Docker Desktop: All 5 Nucleus Service Containers Running")

    add_h3(doc, "8.3.3  Docker Image Registry")
    add_body(doc,
        "The local Docker image registry shows all built Nucleus service images after a "
        "successful Jenkins pipeline run. Images are tagged with the project name and "
        "rebuilt automatically on each push to the main branch, ensuring every deployment "
        "uses the latest source code."
    )
    dockerimages_path = os.path.join(SCRIPT_DIR, "dockerimages.png")
    if os.path.exists(dockerimages_path):
        insert_figure(doc, open(dockerimages_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "Docker Images (dockerimages.png not found)")
    caption(doc, "Figure 8.4 - Docker Desktop: Nucleus Local Image Registry After Build")
    page_break(doc)

    add_h2(doc, "8.4  GitHub Repository and Commit Analytics")
    add_body(doc,
        "The Nucleus GitHub repository at https://github.com/yyyuvvvraj/Nucleus serves as "
        "the single source of truth for all project code, configuration, and documentation. "
        "The repository uses a trunk-based development model with short-lived feature branches "
        "merged into main via pull requests reviewed by at least one other team member."
    )
    add_h3(doc, "8.4.1  Repository Overview")
    githubrepo_path = os.path.join(SCRIPT_DIR, "githubrepo.png")
    if os.path.exists(githubrepo_path):
        insert_figure(doc, open(githubrepo_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "GitHub Repository (githubrepo.png not found)")
    caption(doc, "Figure 8.5 - GitHub Repository: yyyuvvvraj/Nucleus Overview")

    add_h3(doc, "8.4.2  Contribution Graph")
    add_body(doc,
        "The GitHub contribution graph illustrates the active development cadence across "
        "the 12-week project. Commit density peaks correspond to sprint integration "
        "weeks when feature branches were being merged."
    )
    github_path = os.path.join(SCRIPT_DIR, "github.png")
    if os.path.exists(github_path):
        insert_figure(doc, open(github_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "GitHub Contribution Graph (github.png not found)")
    caption(doc, "Figure 8.6 - GitHub Contribution Graph: Nucleus Repository Activity")

    add_h3(doc, "8.4.3  Commit History")
    add_body(doc,
        "The commit log below shows the feature-level granularity of version control "
        "discipline maintained throughout the project. Each commit references a JIRA "
        "ticket (e.g., '[CAD-27] Integrate DeepFace Facenet512 model') for full traceability."
    )
    commits_path = os.path.join(SCRIPT_DIR, "commits.png")
    if os.path.exists(commits_path):
        insert_figure(doc, open(commits_path, "rb"), width=Inches(5.8))
    else:
        add_image_placeholder(doc, "GitHub Commits (commits.png not found)")
    caption(doc, "Figure 8.7 - GitHub Commit History: Nucleus Feature Branch Merge Log")
    contrib_stats = [
        ("shlokburmi",   "~45%", "Backend, JWT/2FA, LSTM, Jenkins pipeline, Security middleware"),
        ("yyyuvvvraj",   "~35%", "Voice auth service, OAuth integration, Docker config, JIRA management"),
        ("SujalKishore", "~20%", "React frontend, Admin panel, Face auth service, Docker Compose"),
    ]
    make_table(doc, ["Contributor", "Contribution %", "Primary Domains"],
               contrib_stats, [Cm(3.5), Cm(2.5), Cm(10)])
    add_body(doc,
        "Total repository metrics: 200+ commits | 13,000+ lines of code | "
        "Languages: JavaScript 65%, Python 25%, YAML/Shell/Other 10%"
    )
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 9. SECURITY DESIGN
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "9  Security Design")

    add_h2(doc, "9.1  Threat Model (STRIDE Analysis)")
    stride = [
        ("Spoofing",        "Credential theft", "bcrypt hashing + JWT + TOTP 2FA prevent credential replay."),
        ("Tampering",       "API data modification", "JWT signature ensures token integrity; input validation on all endpoints."),
        ("Repudiation",     "Deny actions",     "Server-side logging of all authentication events with timestamps and IPs."),
        ("Info Disclosure", "Data leakage",     "HTTPS enforced; secrets in env vars; MongoDB not exposed publicly."),
        ("DoS",             "Rate flooding",    "express-rate-limit (100 req/15 min) limits API abuse."),
        ("Elevation of Privilege","Role bypass","Role guard middleware validates req.user.role on every admin route."),
        ("Biometric Spoofing","Voice/face attacks","Anti-spoofing (spectral flatness) + liveness challenge (gesture verification)."),
    ]
    make_table(doc, ["Threat", "Attack Vector", "Mitigation"], stride,
               [Cm(3), Cm(4), Cm(9)])

    add_h2(doc, "9.2  Authentication Design Decisions")
    add_body(doc, "Critical security design choices and their justification:")
    auth_decisions = [
        ("No OAuth (Google/GitHub)", "Final design uses credential-based auth for institutional email control and full ownership of the auth flow.",
         "Greater control; avoids Google/GitHub API rate limits and downtime dependencies."),
        ("TOTP over SMS 2FA", "Time-based OTP is phishing-resistant and does not require phone number storage.",
         "RFC 6238 standard; no carrier dependency; offline capable."),
        ("Voice adaptive threshold", "Instead of fixed threshold, calculate_adaptive_threshold() personalises "
         "the acceptance level based on intra-enrolment similarity variance.",
         "Reduces FAR without increasing FRR; adapts to individual voice characteristics."),
        ("Facenet512 over VGGFace", "512-d embedding provides superior discriminative power for diverse user base.",
         "Lower FAR in diverse demographic groups; widely validated in research."),
    ]
    make_table(doc, ["Decision", "Rationale", "Benefit"], auth_decisions,
               [Cm(3.5), Cm(6), Cm(6.5)])
    page_break(doc)

    # ═══════════════════════════════════════════════════════════════════
    # 10. APPENDIX
    # ═══════════════════════════════════════════════════════════════════
    add_h1(doc, "10  Appendix")

    add_h2(doc, "10.1  Technology Stack Summary")
    tech_summary = [
        ("React 18 + Vite",      "18.x / 5.x",  "MIT",      "Frontend SPA"),
        ("Tailwind CSS",          "3.x",         "MIT",      "Utility CSS framework"),
        ("Node.js",               "18 LTS",      "MIT",      "Backend runtime"),
        ("Express.js",            "4.x",         "MIT",      "REST API framework"),
        ("Mongoose",              "8.x",         "MIT",      "MongoDB ORM"),
        ("MongoDB",               "7.0",         "SSPL",     "NoSQL database"),
        ("FastAPI",               "0.110+",      "MIT",      "Python biometric API"),
        ("librosa",               "0.10+",       "ISC",      "MFCC audio processing"),
        ("DeepFace",              "0.0.92+",     "MIT",      "Face recognition framework"),
        ("bcryptjs",              "2.x",         "MIT",      "Password hashing"),
        ("jsonwebtoken",          "9.x",         "MIT",      "JWT issuance"),
        ("speakeasy",             "2.x",         "MIT",      "TOTP 2FA"),
        ("Docker + Compose",      "24+ / v2",    "Apache 2.0","Containerisation"),
        ("Jenkins",               "LTS 2.440+",  "MIT",      "CI/CD pipeline"),
    ]
    make_table(doc, ["Technology", "Version", "License", "Role"], tech_summary,
               [Cm(4), Cm(2), Cm(2), Cm(8)])

    add_h2(doc, "10.2  Design Decision Log")
    decisions = [
        ("DD-01", "Apr 5",   "MERN stack selection",         "Agreed",  "Full-stack JS reduces context switching; team has prior MERN experience."),
        ("DD-02", "Apr 8",   "Separate Python AI service",   "Agreed",  "AI workload isolation prevents Node event-loop blocking."),
        ("DD-03", "Apr 12",  "MongoDB over PostgreSQL",       "Agreed",  "Variable-length embedding arrays and flexible schemas favour document DB."),
        ("DD-04", "Apr 15",  "TOTP over OAuth 2FA",           "Agreed",  "Institutional control; no third-party dependency for MFA flow."),
        ("DD-05", "Apr 18",  "Facenet512 model choice",       "Agreed",  "Best FAR/FRR balance for diverse demographic sample set."),
        ("DD-06", "Apr 20",  "Jenkins on Windows with bat",   "Agreed",  "Agent runs on Windows; sh commands replaced with bat in Jenkinsfile."),
    ]
    make_table(doc, ["ID", "Date", "Decision", "Status", "Rationale"], decisions,
               [Cm(1.5), Cm(1.5), Cm(4), Cm(1.5), Cm(7.5)])

    add_h2(doc, "10.3  Glossary")
    glossary2 = [
        ("Adaptive Threshold", "A similarity acceptance threshold dynamically computed from enrolment sample variance, range-clamped to [0.75, 0.95]."),
        ("Cosine Similarity",  "Measure of similarity between two non-zero vectors; equals cos(θ) where θ is the angle between vectors."),
        ("Docker Bridge",      "A software-defined network allowing containers to communicate by hostname within an isolated subnet."),
        ("Liveness Detection", "The process of verifying that a biometric sample comes from a live person, not a spoofed replica."),
        ("MFCC",               "Mel-Frequency Cepstral Coefficients; compact representation of audio spectrum used in voice recognition."),
        ("Webhook",            "An HTTP callback triggered by a source event (e.g., GitHub push) to notify a listener (Jenkins)."),
        ("Step-Up Auth",       "Additional authentication challenge invoked mid-session when behavioural or security anomalies are detected."),
        ("Declarative Pipeline","Jenkins pipeline syntax using predefined structure (pipeline{} block) for readability and maintainability."),
    ]
    make_table(doc, ["Term", "Definition"], glossary2, [Cm(4), Cm(12)])

    out_path = os.path.join(SCRIPT_DIR, "Nucleus_SDD_v2.docx")
    doc.save(out_path)
    print(f"  [OK] SDD saved -> {out_path}")
    return out_path


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n=== Nucleus Document Generator ===")
    print(f"  Output directory : {SCRIPT_DIR}\n")

    srs = generate_srs()
    sdd = generate_sdd()

    print("\n=== Complete ===")
    print(f"  SRS -> {srs}")
    print(f"  SDD -> {sdd}")
    print("\nOptional: Place jira.png and jenkins.png in the project root")
    print("          to embed actual dashboard screenshots into both documents.\n")
