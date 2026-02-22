import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Volume2,
	VolumeX,
	Mic,
	MicOff,
	Sun,
	Moon,
	Contrast,
	ZoomIn,
	ZoomOut,
	BookOpen,
	Settings,
	Keyboard,
	Play,
	Pause,
	Square,
	RotateCcw,
	Eye,
	Upload,
	FileText,
	X,
	Camera,
	CameraOff,
	FlipHorizontal,
	Download,
	Highlighter,
	Languages,
	ScanText,
	BarChart2,
	PenLine,
	Sparkles,
	FilePlus,
	Save,
} from "lucide-react";
import { requestOpenAIGPTVision } from "@/sdk/api-clients/68a5655cdeb2a0b2f64c013d/requestOpenAIGPTVision";

export const Route = createFileRoute("/")({
	component: App,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = "default" | "high-contrast" | "dark" | "yellow-black";

interface UploadedFile {
	name: string;
	text: string;
}

interface Annotation {
	id: string;
	start: number;
	end: number;
	note: string;
	color: string;
}

interface UserPrefs {
	theme: Theme;
	ttsSpeed: number;
	ttsVoice: string;
	ttsLanguage: string;
	fontSize: number;
	lineSpacing: number;
	lineWidth: number;
	simplifiedReading: boolean;
	magnifierEnabled: boolean;
	magnifierZoom: number;
	shortcuts: Record<string, string>;
	highlightAsRead: boolean;
	colorblindMode: boolean;
	annotationMode: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
	theme: "default",
	ttsSpeed: 1,
	ttsVoice: "",
	ttsLanguage: "en-US",
	fontSize: 16,
	lineSpacing: 1.6,
	lineWidth: 800,
	simplifiedReading: false,
	magnifierEnabled: false,
	magnifierZoom: 2,
	shortcuts: {
		tts: "Alt+T",
		contrast: "Alt+C",
		magnifier: "Alt+M",
		reading: "Alt+R",
		voiceNav: "Alt+V",
	},
	highlightAsRead: false,
	colorblindMode: false,
	annotationMode: false,
};

const STORAGE_KEY = "claryx_prefs";

function loadPrefs(): UserPrefs {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<UserPrefs>) };
	} catch {
		// ignore parse errors
	}
	return { ...DEFAULT_PREFS };
}

function savePrefs(prefs: UserPrefs) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
	} catch {
		// ignore storage errors
	}
}

// ─── Theme helpers ─────────────────────────────────────────────────────────────

function themeCard(theme: Theme) {
	return cn(
		theme === "dark" && "bg-gray-800 border-gray-600 text-white",
		theme === "high-contrast" && "bg-gray-900 border-white text-white",
		theme === "yellow-black" && "bg-yellow-300 border-black text-black",
		theme === "default" && "bg-white border-gray-200 text-gray-900",
	);
}

function themeText(theme: Theme) {
	return cn(
		theme === "dark" && "text-white",
		theme === "high-contrast" && "text-white",
		theme === "yellow-black" && "text-black",
		theme === "default" && "text-gray-900",
	);
}

function themeSubText(theme: Theme) {
	return cn(
		theme === "dark" && "text-gray-300",
		theme === "high-contrast" && "text-gray-200",
		theme === "yellow-black" && "text-gray-800",
		theme === "default" && "text-gray-600",
	);
}

function themeKbd(theme: Theme) {
	return cn(
		"px-2 py-1 rounded text-xs font-mono border",
		theme === "dark" && "bg-gray-700 border-gray-500 text-gray-200",
		theme === "high-contrast" && "bg-black border-yellow-300 text-yellow-300",
		theme === "yellow-black" && "bg-yellow-400 border-black text-black",
		theme === "default" && "bg-gray-100 border-gray-300 text-gray-700",
	);
}

function themeBadge(theme: Theme) {
	return cn(
		"border rounded-lg p-2 text-xs",
		theme === "dark" && "bg-gray-700 border-gray-500 text-gray-200",
		theme === "high-contrast" && "bg-black border-yellow-300 text-yellow-300",
		theme === "yellow-black" && "bg-yellow-400 border-black text-black",
		theme === "default" && "bg-red-50 border-red-200 text-red-700",
	);
}

function themeTabsList(theme: Theme) {
	return cn(
		theme === "dark" && "bg-gray-700",
		theme === "high-contrast" && "bg-gray-800",
		theme === "yellow-black" && "bg-yellow-400",
	);
}

function themeTabsTrigger(theme: Theme) {
	return cn(
		theme === "dark" && "text-gray-200 data-[state=active]:bg-gray-900 data-[state=active]:text-white",
		theme === "high-contrast" && "text-gray-100 data-[state=active]:bg-black data-[state=active]:text-yellow-300",
		theme === "yellow-black" && "text-black data-[state=active]:bg-black data-[state=active]:text-yellow-300",
	);
}

function themeOutlineBtn(theme: Theme) {
	return cn(
		theme === "dark" && "border-gray-600 text-gray-200 hover:bg-gray-700",
		theme === "high-contrast" && "border-yellow-300 text-yellow-300 hover:bg-gray-900",
		theme === "yellow-black" && "border-black text-black hover:bg-yellow-500",
		theme === "default" && "border-gray-200 text-gray-700 hover:bg-gray-50",
	);
}

// ─── Demo content ─────────────────────────────────────────────────────────────

const DEFAULT_SAMPLE_TEXT = `The Web Content Accessibility Guidelines (WCAG) are part of a series of web accessibility guidelines published by the Web Accessibility Initiative of the World Wide Web Consortium.

Accessibility is the practice of making your websites usable by as many people as possible. We traditionally think of this as being about people with disabilities, but the practice of making sites accessible also benefits other groups such as those using mobile devices, or those with slow network connections.

Good accessibility practices benefit everyone. Captions for videos help people in noisy environments. High contrast helps people in bright sunlight. Keyboard navigation helps power users who prefer not to use a mouse.

The four principles of WCAG state that web content must be perceivable, operable, understandable, and robust. These four principles form the foundation of web accessibility and guide developers and designers in creating inclusive digital experiences.`;

// ─── Better TTS ────────────────────────────────────────────────────────────────

function speakSmooth(
	text: string,
	speed: number,
	lang: string,
	voiceName: string,
	voices: SpeechSynthesisVoice[],
	onDone: () => void,
	onWord?: (charIndex: number, charLength: number) => void,
) {
	speechSynthesis.cancel();

	const sentences = text
		.replace(/([.!?])\s+/g, "$1\n")
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);

	if (sentences.length === 0) {
		onDone();
		return;
	}

	const preferredKeywords = ["natural", "enhanced", "neural", "premium", "google", "microsoft"];
	const langVoices = voices.filter((v) => v.lang.startsWith(lang.slice(0, 2)));

	let chosenVoice: SpeechSynthesisVoice | null = null;
	if (voiceName) {
		chosenVoice = langVoices.find((v) => v.name === voiceName) ?? null;
	}
	if (!chosenVoice) {
		chosenVoice =
			langVoices.find((v) =>
				preferredKeywords.some((kw) => v.name.toLowerCase().includes(kw)),
			) ?? langVoices[0] ?? null;
	}

	let idx = 0;

	function speakNext() {
		if (idx >= sentences.length) {
			onDone();
			return;
		}
		const utter = new SpeechSynthesisUtterance(sentences[idx]);
		utter.rate = speed;
		utter.lang = lang;
		utter.pitch = 1.05;
		if (chosenVoice) utter.voice = chosenVoice;

		if (onWord) {
			utter.onboundary = (e) => {
				if (e.name === "word") onWord(e.charIndex, e.charLength ?? 1);
			};
		}

		utter.onend = () => {
			idx++;
			speakNext();
		};
		utter.onerror = () => {
			onDone();
		};
		speechSynthesis.speak(utter);
		idx++;
	}

	speechSynthesis.speak(new SpeechSynthesisUtterance(""));
	setTimeout(() => {
		idx = 0;
		speakNext();
	}, 50);
}

// ─── File text extraction ─────────────────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
	const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
	const isDocx =
		file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
		file.name.endsWith(".docx");
	const isDoc = file.name.endsWith(".doc");
	const isTxt = file.type === "text/plain" || file.name.endsWith(".txt");
	const isImage = file.type.startsWith("image/");

	if (isTxt) return await file.text();

	if (isPdf) {
		const pdfjsLib = await import("pdfjs-dist");
		pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
		const parts: string[] = [];
		for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
			const page = await pdf.getPage(pageNum);
			const textContent = await page.getTextContent();
			const pageText = textContent.items
				.map((item) => ("str" in item ? item.str : ""))
				.join(" ");
			parts.push(pageText);
		}
		return parts.join("\n\n");
	}

	if (isDocx) {
		const mammoth = await import("mammoth");
		const arrayBuffer = await file.arrayBuffer();
		const result = await mammoth.extractRawText({ arrayBuffer });
		return result.value;
	}

	if (isDoc) {
		throw new Error("Old .doc format is not supported. Please save the file as .docx and try again.");
	}

	if (isImage) {
		// OCR via AI vision
		const arrayBuffer = await file.arrayBuffer();
		const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
		const dataUrl = `data:${file.type};base64,${base64}`;
		const result = await requestOpenAIGPTVision({
			body: {
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: "Please extract and transcribe all text visible in this image. Return only the extracted text, preserving the original structure as much as possible.",
							},
							{ type: "image_url", image_url: { url: dataUrl } },
						],
					},
				],
			},
		});
		const data = result.data as { choices?: Array<{ message?: { content?: string } }> } | undefined;
		return data?.choices?.[0]?.message?.content ?? "No text found in image.";
	}

	throw new Error(`Unsupported file type: ${file.name}. Please upload a PDF, DOCX, TXT, or image file.`);
}

// ─── AI Vision helper ─────────────────────────────────────────────────────────

async function analyzeImageWithAI(dataUrl: string, prompt: string): Promise<string> {
	const result = await requestOpenAIGPTVision({
		body: {
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: prompt },
						{ type: "image_url", image_url: { url: dataUrl } },
					],
				},
			],
		},
	});
	const data = result.data as { choices?: Array<{ message?: { content?: string } }> } | undefined;
	return data?.choices?.[0]?.message?.content ?? "Could not analyze image.";
}

// ─── Language detection ────────────────────────────────────────────────────────

async function detectLanguage(text: string): Promise<string> {
	if (!text.trim()) return "en-US";
	// Use a simple heuristic for common scripts
	const cyrillicPattern = /[\u0400-\u04FF]/;
	const arabicPattern = /[\u0600-\u06FF]/;
	const chinesePattern = /[\u4E00-\u9FFF]/;
	const japanesePattern = /[\u3040-\u30FF]/;
	const greekPattern = /[\u0370-\u03FF]/;

	if (cyrillicPattern.test(text)) return "bg-BG";
	if (arabicPattern.test(text)) return "ar-SA";
	if (chinesePattern.test(text)) return "zh-CN";
	if (japanesePattern.test(text)) return "ja-JP";
	if (greekPattern.test(text)) return "el-GR";

	// Try navigator.language for Latin-script fallback
	return "en-US";
}

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
	const [prefs, setPrefs] = React.useState<UserPrefs>(loadPrefs);
	const [activeTab, setActiveTab] = React.useState("tts");

	// TTS state
	const [ttsActive, setTtsActive] = React.useState(false);
	const [ttsPaused, setTtsPaused] = React.useState(false);
	const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
	const [readingProgress, setReadingProgress] = React.useState(0);
	const [highlightRange, setHighlightRange] = React.useState<{ start: number; end: number } | null>(null);

	// Multi-file state
	const [files, setFiles] = React.useState<UploadedFile[]>([]);
	const [activeFileIndex, setActiveFileIndex] = React.useState(-1);
	const [sampleText, setSampleText] = React.useState(DEFAULT_SAMPLE_TEXT);
	const [fileLoading, setFileLoading] = React.useState(false);
	const [fileError, setFileError] = React.useState("");
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Annotation state
	const [annotations, setAnnotations] = React.useState<Annotation[]>([]);
	const [annotationNote, setAnnotationNote] = React.useState("");
	const [selectedAnnotationColor, setSelectedAnnotationColor] = React.useState("#fde047");
	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	// AI summarisation
	const [aiSummary, setAiSummary] = React.useState("");
	const [aiSummarising, setAiSummarising] = React.useState(false);

	// Voice nav state
	const [voiceNavActive, setVoiceNavActive] = React.useState(false);
	const [lastCommand, setLastCommand] = React.useState("");
	const recognitionRef = React.useRef<{ stop: () => void } | null>(null);

	// Magnifier state
	const [magnifierPos, setMagnifierPos] = React.useState({ x: 200, y: 200 });
	const [showMagnifier, setShowMagnifier] = React.useState(false);

	// Toolbar drag
	const [toolbarOffset, setToolbarOffset] = React.useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = React.useState(false);
	const dragStart = React.useRef({ mx: 0, my: 0, tx: 0, ty: 0 });

	// Camera state
	const [cameraActive, setCameraActive] = React.useState(false);
	const [facingMode, setFacingMode] = React.useState<"user" | "environment">("environment");
	const [cameraAnalysis, setCameraAnalysis] = React.useState("");
	const [cameraAnalysing, setCameraAnalysing] = React.useState(false);
	const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const streamRef = React.useRef<MediaStream | null>(null);

	// Camera voice commands
	const [cameraVoiceActive, setCameraVoiceActive] = React.useState(false);
	const cameraRecognitionRef = React.useRef<{ stop: () => void } | null>(null);

	// Persist prefs
	React.useEffect(() => {
		savePrefs(prefs);
	}, [prefs]);

	// Load voices
	React.useEffect(() => {
		const load = () => setVoices(speechSynthesis.getVoices());
		load();
		speechSynthesis.addEventListener("voiceschanged", load);
		return () => speechSynthesis.removeEventListener("voiceschanged", load);
	}, []);

	function updatePref<K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) {
		setPrefs((p) => ({ ...p, [key]: value }));
	}

	function cycleTheme() {
		const themes: Theme[] = ["default", "dark", "high-contrast", "yellow-black"];
		const idx = themes.indexOf(prefs.theme);
		updatePref("theme", themes[(idx + 1) % themes.length]);
	}

	// ── TTS ──────────────────────────────────────────────────────────────────

	const handleTtsStart = React.useCallback(
		(text: string) => {
			if (!text.trim()) return;
			setTtsActive(true);
			setTtsPaused(false);
			setReadingProgress(0);

			const totalLen = text.length;

			speakSmooth(
				text,
				prefs.ttsSpeed,
				prefs.ttsLanguage,
				prefs.ttsVoice,
				voices,
				() => {
					setTtsActive(false);
					setTtsPaused(false);
					setReadingProgress(100);
					setHighlightRange(null);
				},
				prefs.highlightAsRead
					? (charIndex, charLength) => {
						setHighlightRange({ start: charIndex, end: charIndex + charLength });
						setReadingProgress(Math.round((charIndex / totalLen) * 100));
					}
					: undefined,
			);
		},
		[prefs.ttsSpeed, prefs.ttsLanguage, prefs.ttsVoice, voices, prefs.highlightAsRead],
	);

	const handleTtsToggle = React.useCallback(() => {
		if (ttsActive) {
			speechSynthesis.cancel();
			setTtsActive(false);
			setTtsPaused(false);
			setHighlightRange(null);
			return;
		}
		const sel = window.getSelection()?.toString().trim();
		handleTtsStart(sel || sampleText);
	}, [ttsActive, handleTtsStart, sampleText]);

	function handleTtsPause() {
		if (ttsPaused) {
			speechSynthesis.resume();
			setTtsPaused(false);
		} else {
			speechSynthesis.pause();
			setTtsPaused(true);
		}
	}

	function handleTtsStop() {
		speechSynthesis.cancel();
		setTtsActive(false);
		setTtsPaused(false);
		setHighlightRange(null);
	}

	// ── AI Summarisation ─────────────────────────────────────────────────────

	async function handleAISummarise() {
		if (!sampleText.trim() || aiSummarising) return;
		setAiSummarising(true);
		setAiSummary("");
		try {
			const result = await requestOpenAIGPTVision({
				body: {
					messages: [
						{
							role: "user",
							content: [
								{
									type: "text",
									text: `Please summarise the following text in 3-5 concise bullet points:\n\n${sampleText.slice(0, 4000)}`,
								},
							],
						},
					],
				},
			});
			const data = result.data as { choices?: Array<{ message?: { content?: string } }> } | undefined;
			setAiSummary(data?.choices?.[0]?.message?.content ?? "Could not generate summary.");
		} catch {
			setAiSummary("Error generating summary. Please try again.");
		} finally {
			setAiSummarising(false);
		}
	}

	// ── Language auto-detect ─────────────────────────────────────────────────

	async function handleAutoDetectLanguage() {
		const lang = await detectLanguage(sampleText);
		updatePref("ttsLanguage", lang);
	}

	// ── Save / Export ─────────────────────────────────────────────────────────

	function handleExportTxt() {
		const blob = new Blob([sampleText], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "claryx-text.txt";
		a.click();
		URL.revokeObjectURL(url);
	}

	// ── Multi-file management ─────────────────────────────────────────────────

	function switchToFile(index: number) {
		if (index < 0 || index >= files.length) return;
		setActiveFileIndex(index);
		setSampleText(files[index].text);
	}

	function removeFile(index: number) {
		const updated = files.filter((_, i) => i !== index);
		setFiles(updated);
		if (activeFileIndex === index) {
			if (updated.length > 0) {
				const newIdx = Math.max(0, index - 1);
				setActiveFileIndex(newIdx);
				setSampleText(updated[newIdx].text);
			} else {
				setActiveFileIndex(-1);
				setSampleText(DEFAULT_SAMPLE_TEXT);
			}
		} else if (activeFileIndex > index) {
			setActiveFileIndex(activeFileIndex - 1);
		}
	}

	// ── Annotations ───────────────────────────────────────────────────────────

	function handleAddAnnotation() {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		if (start === end) return;
		const newAnnotation: Annotation = {
			id: crypto.randomUUID(),
			start,
			end,
			note: annotationNote,
			color: selectedAnnotationColor,
		};
		setAnnotations((prev) => [...prev, newAnnotation]);
		setAnnotationNote("");
	}

	function removeAnnotation(id: string) {
		setAnnotations((prev) => prev.filter((a) => a.id !== id));
	}

	// ── Voice Navigation ─────────────────────────────────────────────────────

	const processVoiceCommand = React.useCallback(
		(cmd: string) => {
			if (cmd.includes("read") || cmd.includes("speak")) {
				const sel = window.getSelection()?.toString().trim();
				handleTtsStart(sel || sampleText);
				setTtsActive(true);
			} else if (cmd.includes("stop") || cmd.includes("quiet")) {
				speechSynthesis.cancel();
				setTtsActive(false);
				setTtsPaused(false);
			} else if (cmd.includes("pause")) {
				speechSynthesis.pause();
				setTtsPaused(true);
			} else if (cmd.includes("dark mode")) {
				setPrefs((p) => ({ ...p, theme: "dark" }));
			} else if (cmd.includes("high contrast")) {
				setPrefs((p) => ({ ...p, theme: "high-contrast" }));
			} else if (cmd.includes("light mode") || cmd.includes("default")) {
				setPrefs((p) => ({ ...p, theme: "default" }));
			} else if (cmd.includes("magnif")) {
				setPrefs((p) => ({ ...p, magnifierEnabled: !p.magnifierEnabled }));
			} else if (cmd.includes("simplif") || cmd.includes("reading mode")) {
				setPrefs((p) => ({ ...p, simplifiedReading: !p.simplifiedReading }));
			} else if (cmd.includes("larger") || cmd.includes("bigger") || cmd.includes("zoom in")) {
				setPrefs((p) => ({ ...p, fontSize: Math.min(p.fontSize + 2, 32) }));
			} else if (cmd.includes("smaller") || cmd.includes("zoom out")) {
				setPrefs((p) => ({ ...p, fontSize: Math.max(p.fontSize - 2, 12) }));
			} else if (cmd.includes("faster") || cmd.includes("speed up")) {
				setPrefs((p) => ({ ...p, ttsSpeed: Math.min(p.ttsSpeed + 0.25, 3) }));
			} else if (cmd.includes("slower") || cmd.includes("slow down")) {
				setPrefs((p) => ({ ...p, ttsSpeed: Math.max(p.ttsSpeed - 0.25, 0.5) }));
			}
		},
		[handleTtsStart, sampleText],
	);

	const handleVoiceNavToggle = React.useCallback(() => {
		if (voiceNavActive) {
			recognitionRef.current?.stop();
			setVoiceNavActive(false);
			setLastCommand("");
			return;
		}

		interface SpeechRecognitionInstance {
			continuous: boolean;
			interimResults: boolean;
			lang: string;
			start: () => void;
			stop: () => void;
			onresult: ((event: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
			onerror: (() => void) | null;
			onend: (() => void) | null;
		}
		type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
		const SpeechRecognitionClass: SpeechRecognitionCtor | undefined =
			(window as unknown as Record<string, unknown>).SpeechRecognition as SpeechRecognitionCtor ||
			(window as unknown as Record<string, unknown>).webkitSpeechRecognition as SpeechRecognitionCtor;

		if (!SpeechRecognitionClass) {
			setLastCommand("Voice recognition not supported in this browser.");
			return;
		}

		const recognition = new SpeechRecognitionClass();
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = prefs.ttsLanguage;

		recognition.onresult = (event) => {
			const results = event.results;
			const last = results[results.length - 1];
			const cmd = last[0].transcript.trim().toLowerCase();
			setLastCommand(`"${cmd}"`);
			processVoiceCommand(cmd);
		};
		recognition.onerror = () => {
			setVoiceNavActive(false);
			setLastCommand("Microphone error or permission denied.");
		};
		recognition.onend = () => setVoiceNavActive(false);

		recognitionRef.current = recognition;
		recognition.start();
		setVoiceNavActive(true);
		setLastCommand("Listening…");
	}, [voiceNavActive, prefs.ttsLanguage, processVoiceCommand]);

	// ── Camera ───────────────────────────────────────────────────────────────

	async function startCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode },
				audio: false,
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
			}
			setCameraActive(true);
			setCameraAnalysis("");
			setCapturedImage(null);
		} catch {
			setCameraAnalysis("Could not access camera. Please allow camera permissions.");
		}
	}

	function stopCamera() {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		setCameraActive(false);
	}

	async function flipCamera() {
		const newMode = facingMode === "user" ? "environment" : "user";
		setFacingMode(newMode);
		if (cameraActive) {
			stopCamera();
			// restart with new facing mode — slight delay for cleanup
			setTimeout(async () => {
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						video: { facingMode: newMode },
						audio: false,
					});
					streamRef.current = stream;
					if (videoRef.current) {
						videoRef.current.srcObject = stream;
						videoRef.current.play();
					}
					setCameraActive(true);
				} catch {
					setCameraAnalysis("Could not switch camera.");
				}
			}, 300);
		}
	}

	async function captureAndAnalyse(prompt: string) {
		const video = videoRef.current;
		const canvas = canvasRef.current;
		if (!video || !canvas || !cameraActive) return;

		canvas.width = video.videoWidth || 640;
		canvas.height = video.videoHeight || 480;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
		setCapturedImage(dataUrl);
		setCameraAnalysing(true);
		setCameraAnalysis("");

		try {
			const result = await analyzeImageWithAI(dataUrl, prompt);
			setCameraAnalysis(result);
		} catch {
			setCameraAnalysis("Error analysing image. Please try again.");
		} finally {
			setCameraAnalysing(false);
		}
	}

	function analyseCapture() {
		const prompt = prefs.colorblindMode
			? "Describe this image in detail. For every significant color you see, explicitly name the color and what object it belongs to. Be specific about hues (e.g., 'deep red', 'sky blue'). This is for a user with colorblindness."
			: "Describe what you see in this image in a clear and detailed way.";
		captureAndAnalyse(prompt);
	}

	async function analyseUploadedImageFile(file: File) {
		const arrayBuffer = await file.arrayBuffer();
		const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
		const dataUrl = `data:${file.type};base64,${base64}`;
		setCapturedImage(dataUrl);
		setCameraAnalysing(true);
		setCameraAnalysis("");
		try {
			const prompt = prefs.colorblindMode
				? "Describe this image in detail. For every significant color you see, explicitly name the color and what object it belongs to. Be specific about hues (e.g., 'deep red', 'sky blue'). This is for a user with colorblindness."
				: "Describe what you see in this image in a clear and detailed way.";
			const result = await analyzeImageWithAI(dataUrl, prompt);
			setCameraAnalysis(result);
		} catch {
			setCameraAnalysis("Error analysing image.");
		} finally {
			setCameraAnalysing(false);
		}
	}

	// Camera voice commands
	const processCameraVoiceCommand = React.useCallback(
		(cmd: string) => {
			if (cmd.includes("take photo") || cmd.includes("capture") || cmd.includes("snap")) {
				analyseCapture();
			} else if (cmd.includes("describe") || cmd.includes("what do you see") || cmd.includes("analyze")) {
				analyseCapture();
			} else if (cmd.includes("flip") || cmd.includes("switch camera") || cmd.includes("rotate")) {
				flipCamera();
			} else if (cmd.includes("stop camera") || cmd.includes("close camera")) {
				stopCamera();
				setCameraVoiceActive(false);
				cameraRecognitionRef.current?.stop();
			} else if (cmd.includes("colors") || cmd.includes("colour") || cmd.includes("color mode")) {
				captureAndAnalyse("Describe every color visible in this image in detail, naming each color for a colorblind user.");
			}
		},
		[facingMode, cameraActive, prefs.colorblindMode],
	);

	function toggleCameraVoice() {
		if (cameraVoiceActive) {
			cameraRecognitionRef.current?.stop();
			setCameraVoiceActive(false);
			return;
		}

		interface SpeechRecognitionInstance {
			continuous: boolean;
			interimResults: boolean;
			lang: string;
			start: () => void;
			stop: () => void;
			onresult: ((event: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
			onerror: (() => void) | null;
			onend: (() => void) | null;
		}
		type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
		const SpeechRecognitionClass: SpeechRecognitionCtor | undefined =
			(window as unknown as Record<string, unknown>).SpeechRecognition as SpeechRecognitionCtor ||
			(window as unknown as Record<string, unknown>).webkitSpeechRecognition as SpeechRecognitionCtor;

		if (!SpeechRecognitionClass) return;

		const recognition = new SpeechRecognitionClass();
		recognition.continuous = true;
		recognition.interimResults = false;
		recognition.lang = prefs.ttsLanguage;
		recognition.onresult = (event) => {
			const results = event.results;
			const last = results[results.length - 1];
			const cmd = last[0].transcript.trim().toLowerCase();
			processCameraVoiceCommand(cmd);
		};
		recognition.onerror = () => setCameraVoiceActive(false);
		recognition.onend = () => setCameraVoiceActive(false);
		cameraRecognitionRef.current = recognition;
		recognition.start();
		setCameraVoiceActive(true);
	}

	// Cleanup camera on unmount
	React.useEffect(() => {
		return () => {
			streamRef.current?.getTracks().forEach((t) => t.stop());
		};
	}, []);

	// ── Keyboard shortcuts ────────────────────────────────────────────────────

	React.useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const combo = `${e.altKey ? "Alt+" : ""}${e.ctrlKey ? "Ctrl+" : ""}${e.key.toUpperCase()}`;
			if (combo === prefs.shortcuts.tts) {
				e.preventDefault();
				handleTtsToggle();
			} else if (combo === prefs.shortcuts.contrast) {
				e.preventDefault();
				cycleTheme();
			} else if (combo === prefs.shortcuts.magnifier) {
				e.preventDefault();
				setPrefs((p) => ({ ...p, magnifierEnabled: !p.magnifierEnabled }));
			} else if (combo === prefs.shortcuts.reading) {
				e.preventDefault();
				setPrefs((p) => ({ ...p, simplifiedReading: !p.simplifiedReading }));
			} else if (combo === prefs.shortcuts.voiceNav) {
				e.preventDefault();
				handleVoiceNavToggle();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [prefs.shortcuts, handleTtsToggle, handleVoiceNavToggle]);

	// ── Magnifier ─────────────────────────────────────────────────────────────

	React.useEffect(() => {
		if (!prefs.magnifierEnabled) {
			setShowMagnifier(false);
			return;
		}
		const handler = (e: MouseEvent) => {
			setMagnifierPos({ x: e.clientX, y: e.clientY });
			setShowMagnifier(true);
		};
		window.addEventListener("mousemove", handler);
		return () => window.removeEventListener("mousemove", handler);
	}, [prefs.magnifierEnabled]);

	// ── Toolbar drag ─────────────────────────────────────────────────────────

	function onToolbarMouseDown(e: React.MouseEvent<HTMLElement>) {
		if ((e.target as HTMLElement).closest("button,[role=button]")) return;
		setIsDragging(true);
		dragStart.current = { mx: e.clientX, my: e.clientY, tx: toolbarOffset.x, ty: toolbarOffset.y };
	}

	React.useEffect(() => {
		if (!isDragging) return;
		const move = (e: MouseEvent) => {
			setToolbarOffset({
				x: dragStart.current.tx + (e.clientX - dragStart.current.mx),
				y: dragStart.current.ty + (e.clientY - dragStart.current.my),
			});
		};
		const up = () => setIsDragging(false);
		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", up);
		return () => {
			window.removeEventListener("mousemove", move);
			window.removeEventListener("mouseup", up);
		};
	}, [isDragging]);

	// ── File upload ───────────────────────────────────────────────────────────

	async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const isImage = file.type.startsWith("image/");

		if (isImage) {
			// Route to camera/image analysis section
			await analyseUploadedImageFile(file);
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}

		setFileLoading(true);
		setFileError("");
		try {
			const text = await extractTextFromFile(file);
			const newFile: UploadedFile = { name: file.name, text };
			setFiles((prev) => {
				const updated = [...prev, newFile];
				setActiveFileIndex(updated.length - 1);
				setSampleText(text);
				return updated;
			});
		} catch (err) {
			setFileError(err instanceof Error ? err.message : "Failed to extract text from file.");
		} finally {
			setFileLoading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}

	// ── Derived ───────────────────────────────────────────────────────────────

	const contentStyle: React.CSSProperties = {
		fontSize: `${prefs.fontSize}px`,
		lineHeight: prefs.lineSpacing,
	};

	const filteredVoices = voices.filter((v) =>
		v.lang.startsWith(prefs.ttsLanguage.slice(0, 2)),
	);

	const languageOptions = [
		{ value: "en-US", label: "English (US)" },
		{ value: "en-GB", label: "English (UK)" },
		{ value: "bg-BG", label: "Bulgarian" },
		{ value: "es-ES", label: "Spanish" },
		{ value: "fr-FR", label: "French" },
		{ value: "de-DE", label: "German" },
		{ value: "it-IT", label: "Italian" },
		{ value: "pt-BR", label: "Portuguese (Brazil)" },
		{ value: "ja-JP", label: "Japanese" },
		{ value: "zh-CN", label: "Chinese (Simplified)" },
		{ value: "ar-SA", label: "Arabic" },
	];

	const t = prefs.theme;

	return (
		<div
			className={cn(
				"min-h-screen transition-colors duration-300",
				t === "dark" && "bg-gray-900 text-white",
				t === "high-contrast" && "bg-black text-white",
				t === "yellow-black" && "bg-yellow-400 text-black",
				t === "default" && "bg-gray-50 text-gray-900",
			)}
		>
			{/* Skip link */}
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
			>
				Skip to main content
			</a>

			{/* ── Magnifier Lens ── */}
			{prefs.magnifierEnabled && showMagnifier && (
				<MagnifierLens x={magnifierPos.x} y={magnifierPos.y} zoom={prefs.magnifierZoom} />
			)}

			{/* ── Floating Toolbar ── */}
			<AccessibilityToolbar
				prefs={prefs}
				ttsActive={ttsActive}
				ttsPaused={ttsPaused}
				voiceNavActive={voiceNavActive}
				isDragging={isDragging}
				toolbarOffset={toolbarOffset}
				onMouseDown={onToolbarMouseDown}
				onTtsToggle={handleTtsToggle}
				onVoiceNavToggle={handleVoiceNavToggle}
				onCycleTheme={cycleTheme}
				onToggleMagnifier={() => updatePref("magnifierEnabled", !prefs.magnifierEnabled)}
				onToggleReading={() => updatePref("simplifiedReading", !prefs.simplifiedReading)}
				onFontIncrease={() => updatePref("fontSize", Math.min(prefs.fontSize + 2, 32))}
				onFontDecrease={() => updatePref("fontSize", Math.max(prefs.fontSize - 2, 12))}
				onOpenSettings={() => setActiveTab("settings")}
			/>

			{/* ── Main Layout ── */}
			<div className="max-w-7xl mx-auto px-4 py-8 pb-28">

				{/* ── CLARYX Title ── */}
				<div className="text-center mb-8">
					<h1
						className={cn(
							"text-5xl font-black tracking-[0.2em] uppercase mb-1",
							t === "high-contrast" && "text-yellow-300",
							t === "yellow-black" && "text-black",
							t === "dark" && "text-white",
							t === "default" && "text-gray-900",
						)}
					>
						CLARYX
					</h1>
					<p className={cn("text-base", themeSubText(t))}>
						Assistive tools for visual, motor, and cognitive accessibility — all in one place.
					</p>
					{/* Active badges */}
					<div className="flex flex-wrap gap-2 mt-3 justify-center" aria-live="polite">
						{ttsActive && (
							<Badge variant="secondary" className={cn(
								t === "dark" && "bg-blue-900 text-blue-200",
								t === "high-contrast" && "bg-blue-900 text-yellow-300 border border-yellow-300",
								t === "yellow-black" && "bg-blue-700 text-white",
								t === "default" && "bg-blue-100 text-blue-800",
							)}>
								<Volume2 size={12} className="mr-1" /> TTS Active
							</Badge>
						)}
						{voiceNavActive && (
							<Badge variant="secondary" className={cn(
								t === "dark" && "bg-red-900 text-red-200",
								t === "high-contrast" && "bg-red-900 text-yellow-300 border border-yellow-300",
								t === "yellow-black" && "bg-red-700 text-white",
								t === "default" && "bg-red-100 text-red-800",
							)}>
								<Mic size={12} className="mr-1" /> Voice Nav On
							</Badge>
						)}
						{prefs.magnifierEnabled && (
							<Badge variant="secondary" className={cn(
								t === "dark" && "bg-green-900 text-green-200",
								t === "high-contrast" && "bg-green-900 text-yellow-300 border border-yellow-300",
								t === "yellow-black" && "bg-green-700 text-white",
								t === "default" && "bg-green-100 text-green-800",
							)}>
								<Eye size={12} className="mr-1" /> Magnifier On
							</Badge>
						)}
						{prefs.simplifiedReading && (
							<Badge variant="secondary" className={cn(
								t === "dark" && "bg-purple-900 text-purple-200",
								t === "high-contrast" && "bg-purple-900 text-yellow-300 border border-yellow-300",
								t === "yellow-black" && "bg-purple-700 text-white",
								t === "default" && "bg-purple-100 text-purple-800",
							)}>
								<BookOpen size={12} className="mr-1" /> Reading Mode
							</Badge>
						)}
						{t !== "default" && (
							<Badge variant="secondary" className={cn(
								t === "dark" && "bg-orange-900 text-orange-200",
								t === "high-contrast" && "bg-orange-900 text-yellow-300 border border-yellow-300",
								t === "yellow-black" && "bg-orange-700 text-white",
							)}>
								<Contrast size={12} className="mr-1" /> {t}
							</Badge>
						)}
					</div>
					{voiceNavActive && lastCommand && (
						<div
							role="status"
							aria-live="polite"
							className={cn("mt-2 text-sm px-3 py-1 rounded-lg inline-block", themeBadge(t))}
						>
							Last command: {lastCommand}
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* ── Left Sidebar ── */}
					<aside aria-label="Accessibility settings" className="space-y-6">
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className={cn("w-full", themeTabsList(t))}>
								<TabsTrigger value="tts" className={cn("flex-1 text-xs", themeTabsTrigger(t))}>
									<Volume2 size={12} className="mr-1" />TTS
								</TabsTrigger>
								<TabsTrigger value="display" className={cn("flex-1 text-xs", themeTabsTrigger(t))}>
									<Sun size={12} className="mr-1" />Display
								</TabsTrigger>
								<TabsTrigger value="settings" className={cn("flex-1 text-xs", themeTabsTrigger(t))}>
									<Settings size={12} className="mr-1" />More
								</TabsTrigger>
							</TabsList>

							{/* TTS Tab */}
							<TabsContent value="tts">
								<Card className={themeCard(t)}>
									<CardHeader>
										<CardTitle className={cn("text-base flex items-center gap-2", themeText(t))}>
											<Volume2 size={16} />Text-to-Speech
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-5">
										<div>
											<Label className={cn("text-xs uppercase tracking-wide mb-2 block", themeSubText(t))}>Playback</Label>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant={ttsActive ? "default" : "outline"}
													onClick={handleTtsToggle}
													className={cn("flex-1", !ttsActive && themeOutlineBtn(t))}
												>
													{ttsActive ? <Square size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
													{ttsActive ? "Stop" : "Play"}
												</Button>
												{ttsActive && (
													<Button size="sm" variant="outline" onClick={handleTtsPause} className={themeOutlineBtn(t)}>
														{ttsPaused ? <Play size={14} /> : <Pause size={14} />}
													</Button>
												)}
												<Button size="sm" variant="outline" onClick={handleTtsStop} className={themeOutlineBtn(t)}>
													<RotateCcw size={14} />
												</Button>
											</div>
										</div>

										{/* Reading Progress */}
										{ttsActive && (
											<div>
												<Label className={cn("text-xs mb-1 block", themeSubText(t))}>Reading Progress: {readingProgress}%</Label>
												<div className={cn("h-2 rounded-full overflow-hidden", t === "dark" ? "bg-gray-700" : t === "high-contrast" ? "bg-gray-800" : t === "yellow-black" ? "bg-yellow-500" : "bg-gray-200")}>
													<div
														className="h-full bg-blue-500 transition-all"
														style={{ width: `${readingProgress}%` }}
													/>
												</div>
											</div>
										)}

										<div>
											<Label htmlFor="tts-speed" className={cn("text-sm mb-2 block", themeText(t))}>
												Speed: {prefs.ttsSpeed.toFixed(2)}×
											</Label>
											<Slider
												id="tts-speed"
												min={0.5}
												max={3}
												step={0.05}
												value={[prefs.ttsSpeed]}
												onValueChange={([v]) => updatePref("ttsSpeed", v)}
											/>
											<div className={cn("flex justify-between text-xs mt-1", themeSubText(t))}>
												<span>0.5×</span><span>1×</span><span>3×</span>
											</div>
										</div>

										<div>
											<div className="flex items-center justify-between mb-2">
												<Label htmlFor="tts-lang" className={cn("text-sm", themeText(t))}>Language</Label>
												<Button
													size="sm"
													variant="outline"
													onClick={handleAutoDetectLanguage}
													className={cn("text-xs h-7 px-2", themeOutlineBtn(t))}
													title="Auto-detect language from text"
												>
													<Languages size={12} className="mr-1" /> Auto-detect
												</Button>
											</div>
											<Select value={prefs.ttsLanguage} onValueChange={(v) => updatePref("ttsLanguage", v)}>
												<SelectTrigger id="tts-lang"><SelectValue /></SelectTrigger>
												<SelectContent>
													{languageOptions.map((l) => (
														<SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{filteredVoices.length > 0 && (
											<div>
												<Label htmlFor="tts-voice" className={cn("text-sm mb-2 block", themeText(t))}>Voice</Label>
												<Select value={prefs.ttsVoice || "none"} onValueChange={(v) => updatePref("ttsVoice", v === "none" ? "" : v)}>
													<SelectTrigger id="tts-voice">
														<SelectValue placeholder="Auto (best available)" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="none">Auto (best available)</SelectItem>
														{filteredVoices.map((v) => (
															<SelectItem key={v.name} value={v.name}>{v.name}</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}

										<div className="flex items-center justify-between">
											<Label htmlFor="highlight-sw" className={cn("text-sm", themeText(t))}>
												<Highlighter size={14} className="inline mr-1" />Highlight as read
											</Label>
											<Switch
												id="highlight-sw"
												checked={prefs.highlightAsRead}
												onCheckedChange={(v) => updatePref("highlightAsRead", v)}
											/>
										</div>
									</CardContent>
								</Card>

								<Card className={cn("mt-4", themeCard(t))}>
									<CardHeader>
										<CardTitle className={cn("text-base flex items-center gap-2", themeText(t))}>
											<Mic size={16} />Voice Navigation
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex items-center justify-between">
											<Label htmlFor="voice-nav-sw" className={cn("text-sm", themeText(t))}>Enable voice commands</Label>
											<Switch
												id="voice-nav-sw"
												checked={voiceNavActive}
												onCheckedChange={(checked) => {
													if (checked) handleVoiceNavToggle();
													else {
														recognitionRef.current?.stop();
														setVoiceNavActive(false);
													}
												}}
											/>
										</div>
										{voiceNavActive && (
											<div role="status" aria-live="polite" className={cn(themeBadge(t))}>
												{lastCommand || "Listening…"}
											</div>
										)}
										<details className="text-xs">
											<summary className={cn("cursor-pointer font-medium hover:opacity-100", themeSubText(t))}>Available commands</summary>
											<ul className={cn("mt-2 space-y-1 list-disc pl-4", themeSubText(t))}>
												<li>&quot;Read&quot; / &quot;Speak&quot; — start TTS</li>
												<li>&quot;Stop&quot; / &quot;Quiet&quot; — stop TTS</li>
												<li>&quot;Pause&quot; — pause TTS</li>
												<li>&quot;Dark mode&quot; / &quot;High contrast&quot; / &quot;Light mode&quot;</li>
												<li>&quot;Magnify&quot; — toggle magnifier</li>
												<li>&quot;Reading mode&quot; — toggle simplified view</li>
												<li>&quot;Larger&quot; / &quot;Smaller&quot; — font size</li>
												<li>&quot;Faster&quot; / &quot;Slower&quot; — TTS speed</li>
											</ul>
										</details>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Display Tab */}
							<TabsContent value="display">
								<Card className={themeCard(t)}>
									<CardHeader>
										<CardTitle className={cn("text-base flex items-center gap-2", themeText(t))}>
											<Contrast size={16} />Display & Themes
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-5">
										<div>
											<Label className={cn("text-xs uppercase tracking-wide mb-3 block", themeSubText(t))}>Color Theme</Label>
											<div className="grid grid-cols-2 gap-2">
												{(["default", "dark", "high-contrast", "yellow-black"] as Theme[]).map((thm) => (
													<button
														key={thm}
														type="button"
														aria-pressed={t === thm}
														onClick={() => updatePref("theme", thm)}
														className={cn(
															"flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
															t === thm
																? "border-blue-500 bg-blue-50 text-blue-700"
																: cn(
																	"hover:border-gray-300",
																	t === "dark" && "border-gray-600 text-gray-200 hover:bg-gray-700",
																	t === "high-contrast" && "border-gray-500 text-gray-100 hover:bg-gray-800",
																	t === "yellow-black" && "border-black text-black hover:bg-yellow-500",
																	t === "default" && "border-gray-200 text-gray-700",
																),
														)}
													>
														{thm === "default" && <Sun size={14} />}
														{thm === "dark" && <Moon size={14} />}
														{thm === "high-contrast" && <Contrast size={14} />}
														{thm === "yellow-black" && <Eye size={14} />}
														<span className="capitalize">{thm.replace("-", " ")}</span>
													</button>
												))}
											</div>
										</div>

										<div>
											<Label htmlFor="font-size-sl" className={cn("text-sm mb-2 block", themeText(t))}>
												Font Size: {prefs.fontSize}px
											</Label>
											<Slider
												id="font-size-sl"
												min={12}
												max={32}
												step={1}
												value={[prefs.fontSize]}
												onValueChange={([v]) => updatePref("fontSize", v)}
											/>
											<div className={cn("flex justify-between text-xs mt-1", themeSubText(t))}>
												<span>12px</span><span>22px</span><span>32px</span>
											</div>
										</div>

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<Label htmlFor="magnifier-sw" className={cn("text-sm", themeText(t))}>Screen Magnifier</Label>
												<Switch
													id="magnifier-sw"
													checked={prefs.magnifierEnabled}
													onCheckedChange={(v) => updatePref("magnifierEnabled", v)}
												/>
											</div>
											{prefs.magnifierEnabled && (
												<div>
													<Label htmlFor="magnifier-zoom-sl" className={cn("text-sm mb-2 block", themeText(t))}>
														Zoom: {prefs.magnifierZoom}×
													</Label>
													<Slider
														id="magnifier-zoom-sl"
														min={1.5}
														max={5}
														step={0.5}
														value={[prefs.magnifierZoom]}
														onValueChange={([v]) => updatePref("magnifierZoom", v)}
													/>
												</div>
											)}
										</div>

										<div className="flex items-center justify-between">
											<Label htmlFor="colorblind-sw" className={cn("text-sm", themeText(t))}>
												<Eye size={14} className="inline mr-1" />Colorblindness mode
											</Label>
											<Switch
												id="colorblind-sw"
												checked={prefs.colorblindMode}
												onCheckedChange={(v) => updatePref("colorblindMode", v)}
											/>
										</div>
										{prefs.colorblindMode && (
											<p className={cn("text-xs", themeSubText(t))}>
												AI camera descriptions will explicitly name every color for colorblind users.
											</p>
										)}
									</CardContent>
								</Card>

								<Card className={cn("mt-4", themeCard(t))}>
									<CardHeader>
										<CardTitle className={cn("text-base flex items-center gap-2", themeText(t))}>
											<BookOpen size={16} />Reading Mode
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center justify-between">
											<Label htmlFor="reading-sw" className={cn("text-sm", themeText(t))}>Simplified reading</Label>
											<Switch
												id="reading-sw"
												checked={prefs.simplifiedReading}
												onCheckedChange={(v) => updatePref("simplifiedReading", v)}
											/>
										</div>
										{prefs.simplifiedReading && (
											<>
												<div>
													<Label htmlFor="line-spacing-sl" className={cn("text-sm mb-2 block", themeText(t))}>
														Line Spacing: {prefs.lineSpacing}
													</Label>
													<Slider
														id="line-spacing-sl"
														min={1}
														max={3}
														step={0.1}
														value={[prefs.lineSpacing]}
														onValueChange={([v]) => updatePref("lineSpacing", v)}
													/>
												</div>
												<div>
													<Label htmlFor="line-width-sl" className={cn("text-sm mb-2 block", themeText(t))}>
														Max Width: {prefs.lineWidth}px
													</Label>
													<Slider
														id="line-width-sl"
														min={400}
														max={1200}
														step={50}
														value={[prefs.lineWidth]}
														onValueChange={([v]) => updatePref("lineWidth", v)}
													/>
												</div>
											</>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							{/* More Tab */}
							<TabsContent value="settings">
								<Card className={themeCard(t)}>
									<CardHeader>
										<CardTitle className={cn("text-base flex items-center gap-2", themeText(t))}>
											<Keyboard size={16} />Keyboard Shortcuts
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										{Object.entries(prefs.shortcuts).map(([action, shortcut]) => (
											<div key={action} className="flex items-center justify-between gap-2">
												<Label className={cn("text-sm capitalize flex-1", themeText(t))}>
													{action.replace(/([A-Z])/g, " $1")}
												</Label>
												<input
													type="text"
													value={shortcut}
													readOnly
													onKeyDown={(e) => {
														e.preventDefault();
														const combo = `${e.altKey ? "Alt+" : ""}${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key.toUpperCase()}`;
														if (e.key.length === 1 || ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"].includes(e.key)) {
															setPrefs((p) => ({ ...p, shortcuts: { ...p.shortcuts, [action]: combo } }));
														}
													}}
													className={cn(
														"w-24 text-center text-xs font-mono border rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
														themeKbd(t),
													)}
													title="Click and press a key combination to change shortcut"
												/>
											</div>
										))}
										<p className={cn("text-xs pt-2", themeSubText(t))}>Click a shortcut field and press a new key combination to customize it.</p>
									</CardContent>
								</Card>

								<Card className={cn("mt-4", themeCard(t))}>
									<CardHeader><CardTitle className={cn("text-base", themeText(t))}>Preferences</CardTitle></CardHeader>
									<CardContent>
										<p className={cn("text-sm mb-3", themeSubText(t))}>Settings are saved automatically to your browser.</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setPrefs({ ...DEFAULT_PREFS });
												localStorage.removeItem(STORAGE_KEY);
											}}
											className={cn("w-full", themeOutlineBtn(t))}
										>
											<RotateCcw size={14} className="mr-2" />
											Reset all preferences
										</Button>
									</CardContent>
								</Card>

								<Card className={cn("mt-4", themeCard(t))}>
									<CardHeader><CardTitle className={cn("text-base", themeText(t))}>Toolbar</CardTitle></CardHeader>
									<CardContent>
										<p className={cn("text-sm mb-3", themeSubText(t))}>Drag the toolbar anywhere on screen.</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setToolbarOffset({ x: 0, y: 0 })}
											className={cn("w-full", themeOutlineBtn(t))}
										>
											<RotateCcw size={14} className="mr-2" />
											Reset toolbar position
										</Button>
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>

						{/* ── Features at a Glance (left) ── */}
						<section aria-labelledby="features-heading">
							<h2 id="features-heading" className={cn("text-lg font-semibold mb-3", themeText(t))}>Features at a Glance</h2>
							<div className="space-y-2">
								<FeatureCard icon={<Volume2 size={16} />} title="Text-to-Speech" description="Read text aloud with natural voice, adjustable speed and language." theme={t} />
								<FeatureCard icon={<Highlighter size={16} />} title="Highlight-as-Read" description="Highlights words in sync with TTS playback." theme={t} />
								<FeatureCard icon={<Mic size={16} />} title="Voice Commands" description="Control features hands-free with voice." theme={t} />
								<FeatureCard icon={<Contrast size={16} />} title="Themes" description="High-contrast, dark, and yellow-black themes." theme={t} />
								<FeatureCard icon={<Eye size={16} />} title="Magnifier" description="Zoom lens follows your cursor." theme={t} />
								<FeatureCard icon={<Camera size={16} />} title="AI Camera" description="Describe what camera sees, with colorblindness support." theme={t} />
								<FeatureCard icon={<ScanText size={16} />} title="OCR / Image Text" description="Extract text from images using AI." theme={t} />
								<FeatureCard icon={<Sparkles size={16} />} title="AI Summarisation" description="Summarise long text with one click." theme={t} />
								<FeatureCard icon={<FilePlus size={16} />} title="Multi-file" description="Upload and switch between multiple documents." theme={t} />
								<FeatureCard icon={<Save size={16} />} title="Save / Export" description="Download text as a .txt file." theme={t} />
								<FeatureCard icon={<Languages size={16} />} title="Language Auto-detect" description="Detect text language automatically." theme={t} />
								<FeatureCard icon={<BarChart2 size={16} />} title="Reading Progress" description="Visual progress bar during TTS." theme={t} />
								<FeatureCard icon={<PenLine size={16} />} title="Annotations" description="Highlight selections and add notes." theme={t} />
								<FeatureCard icon={<Upload size={16} />} title="File Import" description="PDF, DOCX, TXT, and image files." theme={t} />
							</div>
						</section>

						{/* ── Keyboard Reference (left) ── */}
						<section aria-labelledby="kb-ref-heading">
							<h2 id="kb-ref-heading" className={cn("text-lg font-semibold mb-3", themeText(t))}>Keyboard Reference</h2>
							<Card className={themeCard(t)}>
								<CardContent className="pt-4">
									<div className="space-y-2">
										{[
											{ key: prefs.shortcuts.tts, action: "Toggle Text-to-Speech" },
											{ key: prefs.shortcuts.voiceNav, action: "Toggle Voice Navigation" },
											{ key: prefs.shortcuts.magnifier, action: "Toggle Magnifier" },
											{ key: prefs.shortcuts.reading, action: "Toggle Reading Mode" },
											{ key: prefs.shortcuts.contrast, action: "Cycle Color Theme" },
											{ key: "Tab", action: "Move focus forward" },
											{ key: "Shift+Tab", action: "Move focus backward" },
											{ key: "Enter / Space", action: "Activate button" },
										].map(({ key, action }) => (
											<div key={key} className="flex items-center gap-3">
												<kbd className={cn("min-w-[5rem] text-center shrink-0 text-xs", themeKbd(t))}>
													{key}
												</kbd>
												<span className={cn("text-xs", themeSubText(t))}>{action}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</section>
					</aside>

					{/* ── Content Area ── */}
					<main id="main-content" className="lg:col-span-2 space-y-6" tabIndex={-1}>
						{/* Quick actions */}
						<section aria-labelledby="qa-heading">
							<h2 id="qa-heading" className={cn("text-lg font-semibold mb-3", themeText(t))}>Quick Actions</h2>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
								<QuickActionCard
									icon={<Volume2 size={20} />}
									label="Read Aloud"
									description="Select text then click, or use sample text"
									active={ttsActive}
									onClick={handleTtsToggle}
									shortcut={prefs.shortcuts.tts}
									theme={t}
								/>
								<QuickActionCard
									icon={<Mic size={20} />}
									label="Voice Nav"
									description="Control with your voice"
									active={voiceNavActive}
									onClick={handleVoiceNavToggle}
									shortcut={prefs.shortcuts.voiceNav}
									theme={t}
								/>
								<QuickActionCard
									icon={<Eye size={20} />}
									label="Magnifier"
									description="Follows your cursor"
									active={prefs.magnifierEnabled}
									onClick={() => updatePref("magnifierEnabled", !prefs.magnifierEnabled)}
									shortcut={prefs.shortcuts.magnifier}
									theme={t}
								/>
								<QuickActionCard
									icon={<BookOpen size={20} />}
									label="Reading Mode"
									description="Distraction-free layout"
									active={prefs.simplifiedReading}
									onClick={() => updatePref("simplifiedReading", !prefs.simplifiedReading)}
									shortcut={prefs.shortcuts.reading}
									theme={t}
								/>
							</div>
						</section>

						{/* ── Camera Section ── */}
						<section aria-labelledby="camera-heading">
							<h2 id="camera-heading" className={cn("text-lg font-semibold mb-3", themeText(t))}>
								<Camera size={18} className="inline mr-2" />AI Camera
							</h2>
							<Card className={themeCard(t)}>
								<CardContent className="pt-4 space-y-4">
									<div className="flex flex-wrap gap-2">
										{!cameraActive ? (
											<Button size="sm" onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white">
												<Camera size={14} className="mr-1" /> Start Camera
											</Button>
										) : (
											<Button size="sm" variant="outline" onClick={stopCamera} className={themeOutlineBtn(t)}>
												<CameraOff size={14} className="mr-1" /> Stop Camera
											</Button>
										)}
										{cameraActive && (
											<>
												<Button size="sm" variant="outline" onClick={flipCamera} className={themeOutlineBtn(t)} title="Flip front/back camera">
													<FlipHorizontal size={14} className="mr-1" /> Flip
												</Button>
												<Button
													size="sm"
													onClick={analyseCapture}
													disabled={cameraAnalysing}
													className="bg-green-600 hover:bg-green-700 text-white"
												>
													<Sparkles size={14} className="mr-1" />
													{cameraAnalysing ? "Analysing…" : "Describe"}
												</Button>
												<Button
													size="sm"
													variant={cameraVoiceActive ? "default" : "outline"}
													onClick={toggleCameraVoice}
													className={cn(!cameraVoiceActive && themeOutlineBtn(t), cameraVoiceActive && "bg-red-500 text-white animate-pulse")}
													title="Voice commands: 'take photo', 'describe', 'flip', 'stop camera'"
												>
													{cameraVoiceActive ? <Mic size={14} className="mr-1" /> : <MicOff size={14} className="mr-1" />}
													{cameraVoiceActive ? "Listening…" : "Voice Cmd"}
												</Button>
											</>
										)}
										<label className={cn("cursor-pointer inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border font-medium transition-colors", themeOutlineBtn(t))}>
											<Upload size={14} /> Upload Image
											<input
												type="file"
												accept="image/*"
												className="hidden"
												onChange={async (e) => {
													const file = e.target.files?.[0];
													if (file) await analyseUploadedImageFile(file);
													e.target.value = "";
												}}
											/>
										</label>
									</div>

									{cameraVoiceActive && (
										<p className={cn("text-xs", themeSubText(t))}>
											Voice commands: &quot;take photo&quot;, &quot;describe&quot;, &quot;flip&quot;, &quot;colors&quot;, &quot;stop camera&quot;
										</p>
									)}

									{prefs.colorblindMode && (
										<p className={cn("text-xs px-2 py-1 rounded", t === "dark" ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-blue-700")}>
											Colorblindness mode ON — AI will explicitly name every color in descriptions.
										</p>
									)}

									{cameraActive && (
										<div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-64">
											<video
												ref={videoRef}
												className="w-full h-full object-contain"
												autoPlay
												playsInline
												muted
											/>
										</div>
									)}

									{capturedImage && (
										<div className="space-y-2">
											<p className={cn("text-xs font-medium", themeSubText(t))}>Captured image:</p>
											<img
												src={capturedImage}
												alt="Captured"
												className="rounded-xl max-h-48 object-contain border"
											/>
										</div>
									)}

									{cameraAnalysing && (
										<div className={cn("text-sm animate-pulse", themeSubText(t))}>
											Analysing image with AI…
										</div>
									)}

									{cameraAnalysis && (
										<div className={cn("rounded-xl p-3 text-sm", t === "dark" ? "bg-gray-700" : t === "high-contrast" ? "bg-gray-800" : t === "yellow-black" ? "bg-yellow-200" : "bg-blue-50")}>
											<p className={cn("font-semibold text-xs mb-1", themeSubText(t))}>AI sees:</p>
											<p className={themeText(t)}>{cameraAnalysis}</p>
											<Button
												size="sm"
												variant="outline"
												className={cn("mt-2", themeOutlineBtn(t))}
												onClick={() => handleTtsStart(cameraAnalysis)}
											>
												<Volume2 size={12} className="mr-1" /> Read aloud
											</Button>
										</div>
									)}

									<canvas ref={canvasRef} className="hidden" />
								</CardContent>
							</Card>
						</section>

						{/* Sample content — multi-file + always editable */}
						<section aria-labelledby="demo-heading">
							<div className="flex items-center justify-between mb-3 flex-wrap gap-2">
								<h2 id="demo-heading" className={cn("text-lg font-semibold", themeText(t))}>Content</h2>
								<div className="flex gap-2 flex-wrap">
									<input
										ref={fileInputRef}
										type="file"
										accept=".pdf,.docx,.txt,image/*"
										className="hidden"
										aria-label="Upload PDF, DOCX, TXT, or image file"
										onChange={handleFileUpload}
									/>
									<Button
										size="sm"
										variant="outline"
										disabled={fileLoading}
										onClick={() => fileInputRef.current?.click()}
										className={cn(themeOutlineBtn(t))}
									>
										{fileLoading ? (
											<><span className="animate-spin mr-1">⟳</span> Extracting…</>
										) : (
											<><Upload size={14} className="mr-1" /> Add file</>
										)}
									</Button>

									<Button
										size="sm"
										variant="outline"
										onClick={() => {
											setSampleText(DEFAULT_SAMPLE_TEXT);
											setFiles([]);
											setActiveFileIndex(-1);
											setFileError("");
											setAiSummary("");
											setAnnotations([]);
										}}
										className={cn(themeOutlineBtn(t))}
									>
										<RotateCcw size={14} className="mr-1" /> Reset
									</Button>

									<Button
										size="sm"
										variant="outline"
										onClick={handleExportTxt}
										className={cn(themeOutlineBtn(t))}
										title="Save as .txt"
									>
										<Download size={14} className="mr-1" /> Save
									</Button>

									<Button
										size="sm"
										variant={aiSummarising ? "default" : "outline"}
										onClick={handleAISummarise}
										disabled={aiSummarising}
										className={cn(!aiSummarising && themeOutlineBtn(t))}
									>
										<Sparkles size={14} className="mr-1" />
										{aiSummarising ? "Summarising…" : "Summarise"}
									</Button>

									{ttsActive && (
										<Button size="sm" variant="outline" onClick={handleTtsPause} className={cn(themeOutlineBtn(t))}>
											{ttsPaused ? <Play size={14} className="mr-1" /> : <Pause size={14} className="mr-1" />}
											{ttsPaused ? "Resume" : "Pause"}
										</Button>
									)}

									<Button
										size="sm"
										variant={ttsActive ? "default" : "outline"}
										onClick={handleTtsToggle}
										className={cn(!ttsActive && themeOutlineBtn(t))}
									>
										<Volume2 size={14} className="mr-1" />
										{ttsActive ? "Stop" : "Read"}
									</Button>
								</div>
							</div>

							{/* Multi-file tabs */}
							{files.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-3">
									<button
										type="button"
										onClick={() => { setActiveFileIndex(-1); setSampleText(DEFAULT_SAMPLE_TEXT); }}
										className={cn(
											"text-xs px-3 py-1 rounded-full border font-medium transition-colors",
											activeFileIndex === -1
												? "bg-blue-500 text-white border-blue-600"
												: cn("hover:border-blue-300", themeOutlineBtn(t)),
										)}
									>
										Default
									</button>
									{files.map((f, i) => (
										<div key={i} className="flex items-center gap-1">
											<button
												type="button"
												onClick={() => switchToFile(i)}
												className={cn(
													"text-xs px-3 py-1 rounded-full border font-medium transition-colors",
													activeFileIndex === i
														? "bg-blue-500 text-white border-blue-600"
														: cn("hover:border-blue-300", themeOutlineBtn(t)),
												)}
											>
												<FileText size={10} className="inline mr-1" />{f.name.slice(0, 20)}{f.name.length > 20 ? "…" : ""}
											</button>
											<button
												type="button"
												aria-label={`Remove ${f.name}`}
												onClick={() => removeFile(i)}
												className={cn("opacity-60 hover:opacity-100", themeSubText(t))}
											>
												<X size={12} />
											</button>
										</div>
									))}
								</div>
							)}

							{fileError && (
								<div className="mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
									{fileError}
								</div>
							)}

							{/* AI Summary */}
							{aiSummary && (
								<Card className={cn("mb-3", themeCard(t))}>
									<CardContent className="pt-4">
										<div className="flex items-center gap-2 mb-2">
											<Sparkles size={14} className="text-blue-500" />
											<span className={cn("text-xs font-semibold", themeText(t))}>AI Summary</span>
											<button type="button" onClick={() => setAiSummary("")} className="ml-auto opacity-60 hover:opacity-100"><X size={12} /></button>
										</div>
										<p className={cn("text-sm whitespace-pre-line", themeText(t))}>{aiSummary}</p>
									</CardContent>
								</Card>
							)}

							<Card
								className={cn(themeCard(t))}
								style={prefs.simplifiedReading ? { maxWidth: `${prefs.lineWidth}px` } : undefined}
							>
								<CardContent className="pt-4">
									<p className={cn("text-xs mb-2", themeSubText(t))}>
										Type or paste any text below. You can also upload a PDF, DOCX, TXT, or image file.
									</p>
									<div className="relative">
										<Textarea
											ref={textareaRef}
											value={sampleText}
											onChange={(e) => setSampleText(e.target.value)}
											style={contentStyle}
											className={cn(
												"min-h-[200px] resize-y w-full",
												t === "dark" && "bg-gray-700 border-gray-500 text-white placeholder:text-gray-400",
												t === "high-contrast" && "bg-black border-yellow-300 text-white placeholder:text-gray-400",
												t === "yellow-black" && "bg-yellow-200 border-black text-black placeholder:text-gray-600",
											)}
											placeholder="Enter the text you want to read…"
											aria-label="Editable sample text"
										/>
										{prefs.highlightAsRead && highlightRange && (
											<div
												aria-hidden="true"
												className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
												style={{ fontSize: `${prefs.fontSize}px`, lineHeight: prefs.lineSpacing, padding: "0.5rem 0.75rem" }}
											>
												<span style={{ visibility: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
													{sampleText.slice(0, highlightRange.start)}
												</span>
												<span style={{ background: "rgba(253,224,71,0.7)", borderRadius: "2px" }}>
													{sampleText.slice(highlightRange.start, highlightRange.end)}
												</span>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Annotation Mode */}
							<Card className={cn("mt-3", themeCard(t))}>
								<CardContent className="pt-4">
									<div className="flex items-center justify-between mb-3">
										<span className={cn("text-sm font-semibold flex items-center gap-1", themeText(t))}>
											<PenLine size={14} /> Annotation Mode
										</span>
										<Switch
											checked={prefs.annotationMode}
											onCheckedChange={(v) => updatePref("annotationMode", v)}
										/>
									</div>
									{prefs.annotationMode && (
										<div className="space-y-3">
											<p className={cn("text-xs", themeSubText(t))}>
												Select text in the editor above, then add a note and click &quot;Annotate&quot;.
											</p>
											<div className="flex gap-2 items-center">
												<input
													type="color"
													value={selectedAnnotationColor}
													onChange={(e) => setSelectedAnnotationColor(e.target.value)}
													className="w-8 h-8 rounded cursor-pointer border-0"
													title="Annotation highlight color"
												/>
												<input
													type="text"
													value={annotationNote}
													onChange={(e) => setAnnotationNote(e.target.value)}
													placeholder="Add a note…"
													className={cn(
														"flex-1 text-sm border rounded px-2 py-1",
														t === "dark" && "bg-gray-700 border-gray-500 text-white placeholder:text-gray-400",
														t === "high-contrast" && "bg-black border-yellow-300 text-white",
														t === "yellow-black" && "bg-yellow-200 border-black text-black",
														t === "default" && "bg-white border-gray-300 text-gray-900",
													)}
												/>
												<Button size="sm" onClick={handleAddAnnotation} className="bg-blue-600 hover:bg-blue-700 text-white">
													Annotate
												</Button>
											</div>
											{annotations.length > 0 && (
												<div className="space-y-2 mt-2">
													{annotations.map((ann) => (
														<div
															key={ann.id}
															className={cn("flex items-start gap-2 p-2 rounded-lg border text-xs", themeCard(t))}
														>
															<div
																className="w-3 h-3 mt-0.5 rounded-sm shrink-0"
																style={{ background: ann.color }}
															/>
															<div className="flex-1">
																<span className={cn("font-mono", themeSubText(t))}>
																	[{ann.start}:{ann.end}]
																</span>{" "}
																<span className={themeText(t)}>
																	&quot;{sampleText.slice(ann.start, ann.end).slice(0, 40)}{sampleText.slice(ann.start, ann.end).length > 40 ? "…" : ""}&quot;
																</span>
																{ann.note && <p className={cn("mt-0.5", themeSubText(t))}>{ann.note}</p>}
															</div>
															<button
																type="button"
																onClick={() => removeAnnotation(ann.id)}
																className="opacity-60 hover:opacity-100"
																aria-label="Remove annotation"
															>
																<X size={12} />
															</button>
														</div>
													))}
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						</section>
					</main>
				</div>
			</div>
		</div>
	);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MagnifierLens({ x, y, zoom }: { x: number; y: number; zoom: number }) {
	const size = 220;
	const half = size / 2;
	const borderWidth = 4;

	const translateX = half - x * zoom;
	const translateY = half - y * zoom;

	return (
		<div
			aria-hidden="true"
			style={{
				position: "fixed",
				zIndex: 9999,
				left: x - half,
				top: y - half,
				width: size,
				height: size,
				borderRadius: "50%",
				border: `${borderWidth}px solid #3b82f6`,
				boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
				overflow: "hidden",
				pointerEvents: "none",
				cursor: "none",
				isolation: "isolate",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: window.innerWidth,
					height: window.innerHeight,
					transformOrigin: "top left",
					transform: `scale(${zoom}) translate(${translateX / zoom}px, ${translateY / zoom}px)`,
					willChange: "transform",
				}}
			>
				<iframe
					title="magnifier-view"
					src={window.location.href}
					style={{
						width: window.innerWidth,
						height: window.innerHeight,
						border: "none",
						pointerEvents: "none",
						overflow: "hidden",
					}}
					scrolling="no"
					tabIndex={-1}
					aria-hidden="true"
				/>
			</div>

			<div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
				<div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "rgba(59,130,246,0.4)", transform: "translateX(-50%)" }} />
				<div style={{ position: "absolute", top: "50%", left: 0, height: 1, width: "100%", background: "rgba(59,130,246,0.4)", transform: "translateY(-50%)" }} />
			</div>

			<div
				style={{
					position: "absolute",
					bottom: 6,
					right: 10,
					fontSize: 10,
					fontWeight: 700,
					color: "#3b82f6",
					fontFamily: "monospace",
					background: "rgba(255,255,255,0.75)",
					borderRadius: 3,
					padding: "0 3px",
				}}
			>
				{zoom}×
			</div>
		</div>
	);
}

interface ToolbarProps {
	prefs: UserPrefs;
	ttsActive: boolean;
	ttsPaused: boolean;
	voiceNavActive: boolean;
	isDragging: boolean;
	toolbarOffset: { x: number; y: number };
	onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
	onTtsToggle: () => void;
	onVoiceNavToggle: () => void;
	onCycleTheme: () => void;
	onToggleMagnifier: () => void;
	onToggleReading: () => void;
	onFontIncrease: () => void;
	onFontDecrease: () => void;
	onOpenSettings: () => void;
}

function AccessibilityToolbar({
	prefs,
	ttsActive,
	voiceNavActive,
	isDragging,
	toolbarOffset,
	onMouseDown,
	onTtsToggle,
	onVoiceNavToggle,
	onCycleTheme,
	onToggleMagnifier,
	onToggleReading,
	onFontIncrease,
	onFontDecrease,
	onOpenSettings,
}: ToolbarProps) {
	const isBottom = toolbarOffset.y === 0;
	const posStyle: React.CSSProperties = isBottom
		? { bottom: 24, left: `calc(50% + ${toolbarOffset.x}px)`, transform: "translateX(-50%)" }
		: { top: toolbarOffset.y, left: toolbarOffset.x };

	const t = prefs.theme;

	return (
		<nav
			aria-label="Accessibility toolbar"
			className={cn(
				"fixed z-50 flex items-center gap-1 px-3 py-2 rounded-2xl shadow-xl border select-none",
				isDragging ? "cursor-grabbing" : "cursor-grab",
				t === "dark" && "bg-gray-800 border-gray-600 text-white",
				t === "high-contrast" && "bg-black border-white text-yellow-300",
				t === "yellow-black" && "bg-black border-yellow-400 text-yellow-300",
				t === "default" && "bg-white border-gray-200 text-gray-700",
			)}
			style={posStyle}
			onMouseDown={onMouseDown}
		>
			<span className={cn("text-xs font-semibold mr-1 hidden sm:block", t === "dark" ? "text-gray-400" : t === "high-contrast" ? "text-yellow-400" : t === "yellow-black" ? "text-yellow-300" : "text-gray-500")}>CLARYX</span>

			<ToolbarBtn
				aria-label={ttsActive ? "Stop text-to-speech" : "Start text-to-speech"}
				aria-pressed={ttsActive}
				title={`Text-to-Speech (${prefs.shortcuts.tts})`}
				active={ttsActive}
				theme={t}
				onClick={onTtsToggle}
			>
				{ttsActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
			</ToolbarBtn>

			<ToolbarBtn
				aria-label={voiceNavActive ? "Stop voice navigation" : "Start voice navigation"}
				aria-pressed={voiceNavActive}
				title={`Voice Navigation (${prefs.shortcuts.voiceNav})`}
				active={voiceNavActive}
				activeClass="bg-red-500 text-white animate-pulse"
				theme={t}
				onClick={onVoiceNavToggle}
			>
				{voiceNavActive ? <Mic size={18} /> : <MicOff size={18} />}
			</ToolbarBtn>

			<ToolbarBtn
				aria-label={`Theme: ${prefs.theme}. Click to cycle`}
				title={`Cycle themes (${prefs.shortcuts.contrast})`}
				theme={t}
				onClick={onCycleTheme}
			>
				{t === "dark" ? <Moon size={18} /> : t === "default" ? <Sun size={18} /> : <Contrast size={18} />}
			</ToolbarBtn>

			<ToolbarBtn
				aria-label={prefs.magnifierEnabled ? "Disable magnifier" : "Enable magnifier"}
				aria-pressed={prefs.magnifierEnabled}
				title={`Magnifier (${prefs.shortcuts.magnifier})`}
				active={prefs.magnifierEnabled}
				activeClass="bg-green-500 text-white"
				theme={t}
				onClick={onToggleMagnifier}
			>
				<Eye size={18} />
			</ToolbarBtn>

			<ToolbarBtn
				aria-label={prefs.simplifiedReading ? "Disable reading mode" : "Enable reading mode"}
				aria-pressed={prefs.simplifiedReading}
				title={`Reading Mode (${prefs.shortcuts.reading})`}
				active={prefs.simplifiedReading}
				activeClass="bg-purple-500 text-white"
				theme={t}
				onClick={onToggleReading}
			>
				<BookOpen size={18} />
			</ToolbarBtn>

			<ToolbarBtn aria-label="Decrease font size" theme={t} onClick={onFontDecrease}>
				<ZoomOut size={18} />
			</ToolbarBtn>
			<span aria-live="polite" className={cn("text-xs font-mono w-7 text-center", t === "dark" ? "text-gray-200" : t === "high-contrast" ? "text-yellow-300" : t === "yellow-black" ? "text-yellow-300" : "text-gray-700")}>{prefs.fontSize}</span>
			<ToolbarBtn aria-label="Increase font size" theme={t} onClick={onFontIncrease}>
				<ZoomIn size={18} />
			</ToolbarBtn>

			<ToolbarBtn aria-label="Open settings" theme={t} onClick={onOpenSettings} className="ml-1">
				<Settings size={18} />
			</ToolbarBtn>
		</nav>
	);
}

interface ToolbarBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	active?: boolean;
	activeClass?: string;
	theme: Theme;
}

function ToolbarBtn({ active, activeClass, theme, className, children, ...props }: ToolbarBtnProps) {
	return (
		<button
			type="button"
			className={cn(
				"p-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
				active
					? (activeClass ?? "bg-blue-500 text-white")
					: cn(
						theme === "dark" && "hover:bg-gray-700 text-gray-200",
						theme === "high-contrast" && "hover:bg-gray-800 text-yellow-300",
						theme === "yellow-black" && "hover:bg-gray-800 text-yellow-300",
						theme === "default" && "hover:bg-gray-100 text-gray-700",
					),
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

interface QuickActionCardProps {
	icon: React.ReactNode;
	label: string;
	description: string;
	active: boolean;
	onClick: () => void;
	shortcut: string;
	theme: Theme;
}

function QuickActionCard({ icon, label, description, active, onClick, shortcut, theme }: QuickActionCardProps) {
	return (
		<button
			type="button"
			aria-pressed={active}
			aria-label={`${label}: ${active ? "active" : "inactive"}. ${description}`}
			title={`${label} (${shortcut})`}
			onClick={onClick}
			className={cn(
				"flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
				active
					? "bg-blue-500 text-white border-blue-600 shadow-md"
					: cn(
						"hover:border-blue-300 hover:shadow-sm",
						theme === "high-contrast" && "bg-gray-900 border-white text-white",
						theme === "yellow-black" && "bg-yellow-300 border-black text-black",
						theme === "dark" && "bg-gray-800 border-gray-600 text-white",
						theme === "default" && "bg-white border-gray-200",
					),
			)}
		>
			<div className={cn("p-2 rounded-lg", active ? "bg-white/20" : cn(
				theme === "dark" && "bg-gray-700 text-gray-200",
				theme === "high-contrast" && "bg-gray-800 text-yellow-300",
				theme === "yellow-black" && "bg-yellow-400 text-black",
				theme === "default" && "bg-gray-100 text-gray-600",
			))}>
				{icon}
			</div>
			<div>
				<div className="font-semibold text-sm">{label}</div>
				<div className={cn("text-xs mt-0.5", active ? "text-white/80" : cn(
					theme === "dark" && "text-gray-400",
					theme === "high-contrast" && "text-gray-300",
					theme === "yellow-black" && "text-gray-700",
					theme === "default" && "text-gray-500",
				))}>{description}</div>
			</div>
		</button>
	);
}

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	theme: Theme;
}

function FeatureCard({ icon, title, description, theme }: FeatureCardProps) {
	return (
		<div
			className={cn(
				"flex gap-2 p-3 rounded-lg border text-sm",
				theme === "high-contrast" && "bg-gray-900 border-white text-white",
				theme === "yellow-black" && "bg-yellow-300 border-black text-black",
				theme === "dark" && "bg-gray-800 border-gray-600 text-white",
				theme === "default" && "bg-white border-gray-200",
			)}
		>
			<div className={cn("shrink-0 mt-0.5",
				theme === "dark" ? "text-blue-400" :
				theme === "high-contrast" ? "text-yellow-300" :
				theme === "yellow-black" ? "text-black" :
				"text-blue-600"
			)}>{icon}</div>
			<div>
				<div className="font-semibold text-xs">{title}</div>
				<div className={cn("text-xs mt-0.5", themeSubText(theme))}>{description}</div>
			</div>
		</div>
	);
}
