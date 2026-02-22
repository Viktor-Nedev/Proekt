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
	Gamepad2,
	Trophy,
	RefreshCw,
	Hand,
	Video,
	Type,
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
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<UserPrefs>;
			// Merge shortcuts with defaults so new shortcuts (Alt+M, Alt+R) always apply
			const mergedShortcuts = { ...DEFAULT_PREFS.shortcuts, ...(parsed.shortcuts ?? {}) };
			// Always enforce correct defaults for magnifier and reading shortcuts
			mergedShortcuts.magnifier = mergedShortcuts.magnifier || "Alt+M";
			mergedShortcuts.reading = mergedShortcuts.reading || "Alt+R";
			return { ...DEFAULT_PREFS, ...parsed, shortcuts: mergedShortcuts };
		}
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
		theme === "dark" && "border-gray-400 text-gray-100 hover:bg-gray-700 bg-gray-800",
		theme === "high-contrast" && "border-yellow-300 text-yellow-300 hover:bg-gray-800 bg-gray-900",
		theme === "yellow-black" && "border-black text-black hover:bg-yellow-500",
		theme === "default" && "border-gray-200 text-gray-700 hover:bg-gray-50",
	);
}

// ─── Demo content ─────────────────────────────────────────────────────────────

const DEFAULT_SAMPLE_TEXT = ``;

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

	// Split text into sentences, but track their offsets in the original text
	const rawSentences = text
		.replace(/([.!?。！？])\s+/g, "$1\n")
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);

	if (rawSentences.length === 0) {
		onDone();
		return;
	}

	// Build sentence start offsets so we can map sentence-relative charIndex to full-text position
	const sentenceOffsets: number[] = [];
	let searchFrom = 0;
	for (const sentence of rawSentences) {
		const pos = text.indexOf(sentence, searchFrom);
		sentenceOffsets.push(pos >= 0 ? pos : searchFrom);
		searchFrom = pos >= 0 ? pos + sentence.length : searchFrom + sentence.length;
	}

	const preferredKeywords = ["natural", "enhanced", "neural", "premium", "google", "microsoft"];
	// Try to match on first two chars of lang code (e.g. "en" for "en-US")
	const langCode = lang.slice(0, 2).toLowerCase();
	// Get voices fresh if the cached list is empty (browsers load voices asynchronously)
	const allVoices = voices.length > 0 ? voices : speechSynthesis.getVoices();
	const langVoices = allVoices.filter((v) => v.lang.toLowerCase().startsWith(langCode));
	// Fall back to all voices if none match
	const candidateVoices = langVoices.length > 0 ? langVoices : allVoices;

	let chosenVoice: SpeechSynthesisVoice | null = null;
	if (voiceName) {
		chosenVoice = candidateVoices.find((v) => v.name === voiceName) ?? null;
	}
	if (!chosenVoice) {
		chosenVoice =
			candidateVoices.find((v) =>
				preferredKeywords.some((kw) => v.name.toLowerCase().includes(kw)),
			) ?? candidateVoices[0] ?? null;
	}

	let idx = 0;
	let cancelled = false;

	function speakNext() {
		if (cancelled) return;
		if (idx >= rawSentences.length) {
			onDone();
			return;
		}
		const currentIdx = idx;
		const sentence = rawSentences[currentIdx];
		const sentenceOffset = sentenceOffsets[currentIdx];

		const utter = new SpeechSynthesisUtterance(sentence);
		utter.rate = speed;
		utter.lang = lang;
		utter.pitch = 1.05;
		utter.volume = 1;
		if (chosenVoice) utter.voice = chosenVoice;

		if (onWord) {
			utter.onboundary = (e: SpeechSynthesisEvent) => {
				if (e.name === "word") {
					// Translate sentence-relative position to full-text position
					const globalStart = sentenceOffset + (e.charIndex ?? 0);
					const wordLen = (e.charLength ?? 0) > 0 ? e.charLength : Math.max(1, sentence.slice(e.charIndex ?? 0).search(/\s|$/) || 1);
					onWord(globalStart, wordLen);
				}
			};
		}

		utter.onend = () => {
			if (cancelled) return;
			idx++;
			speakNext();
		};
		utter.onerror = (e: SpeechSynthesisErrorEvent) => {
			// "interrupted" is normal when cancel() is called, don't treat as error
			if (e.error === "interrupted" || e.error === "canceled") return;
			onDone();
		};
		speechSynthesis.speak(utter);
	}

	// Small delay to let speechSynthesis.cancel() flush before starting new speech
	setTimeout(() => {
		if (!cancelled) speakNext();
	}, 100);

	// Return a cancel function (used internally)
	return () => { cancelled = true; };
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

	// Page navigation state: "content" | "camera" | "games" | "signlanguage"
	const [activePage, setActivePage] = React.useState<"content" | "camera" | "games" | "signlanguage" | "about">("content");

	// ── Games state ──────────────────────────────────────────────────────────
	// Colorblind number recognition game
	const [gameActive, setGameActive] = React.useState(false);
	const [gameScore, setGameScore] = React.useState(0);
	const [gameStreak, setGameStreak] = React.useState(0);
	const [gameRound, setGameRound] = React.useState(0);
	const [gameAnswer, setGameAnswer] = React.useState("");
	const [gameFeedback, setGameFeedback] = React.useState<"correct" | "wrong" | null>(null);
	const [gameCurrentNumber, setGameCurrentNumber] = React.useState<number>(0);
	const [gameColors, setGameColors] = React.useState<{ bg: string; dots: string; number: number }>({ bg: "#e8d5b0", dots: "#8b5e3c", number: 12 });
	const [gameDifficulty, setGameDifficulty] = React.useState<"easy" | "medium" | "hard">("easy");
	const [gameTimeLeft, setGameTimeLeft] = React.useState<number | null>(null);
	const [gameSelectedGame, setGameSelectedGame] = React.useState<"ishihara" | "pattern" | "contrast">("ishihara");
	const gameTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

	// Video recording state
	const [isRecording, setIsRecording] = React.useState(false);
	const [recordedVideoUrl, setRecordedVideoUrl] = React.useState<string | null>(null);
	const [recordedVideoBlob, setRecordedVideoBlob] = React.useState<Blob | null>(null);
	const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
	const recordedChunksRef = React.useRef<Blob[]>([]);

	// Camera question state
	const [cameraQuestion, setCameraQuestion] = React.useState("");
	const [cameraQuestionListening, setCameraQuestionListening] = React.useState(false);
	const cameraQuestionRecRef = React.useRef<{ stop: () => void } | null>(null);
	const [videoQuestion, setVideoQuestion] = React.useState("");
	const [videoQuestionListening, setVideoQuestionListening] = React.useState(false);
	const [videoAnalysis, setVideoAnalysis] = React.useState("");
	const [videoAnalysing, setVideoAnalysing] = React.useState(false);
	const videoQuestionRecRef = React.useRef<{ stop: () => void } | null>(null);

	// ── Sign Language state ────────────────────────────────────────────────────
	const [slCameraActive, setSlCameraActive] = React.useState(false);
	const [slFacingMode, setSlFacingMode] = React.useState<"user" | "environment">("user");
	const [slRecognisedText, setSlRecognisedText] = React.useState("");
	const [slAnalysing, setSlAnalysing] = React.useState(false);
	const [slIsRecording, setSlIsRecording] = React.useState(false);
	const [slRecordedVideoUrl, setSlRecordedVideoUrl] = React.useState<string | null>(null);
	const [slRecordedVideoBlob, setSlRecordedVideoBlob] = React.useState<Blob | null>(null);
	const [slUploadedVideoUrl, setSlUploadedVideoUrl] = React.useState<string | null>(null);
	const [slUploadedVideoBlob, setSlUploadedVideoBlob] = React.useState<Blob | null>(null);
	const [slCapturedFrame, setSlCapturedFrame] = React.useState<string | null>(null);
	const [slTranscriptHistory, setSlTranscriptHistory] = React.useState<string[]>([]);
	const [slLiveMode, setSlLiveMode] = React.useState(false);
	const slVideoRef = React.useRef<HTMLVideoElement>(null);
	const slCanvasRef = React.useRef<HTMLCanvasElement>(null);
	const slStreamRef = React.useRef<MediaStream | null>(null);
	const slMediaRecorderRef = React.useRef<MediaRecorder | null>(null);
	const slRecordedChunksRef = React.useRef<Blob[]>([]);
	const slLiveIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

	const ISHIHARA_PLATES_EASY = [
		{ number: 12, bg: "#d4a96a", dots: "#7a5229" },
		{ number: 8, bg: "#c9b99a", dots: "#5c8a3c" },
		{ number: 5, bg: "#e0c8a0", dots: "#4a7a3c" },
		{ number: 6, bg: "#e4d4b0", dots: "#7c4a2c" },
		{ number: 3, bg: "#c8b898", dots: "#6a3a2a" },
	];
	const ISHIHARA_PLATES_MEDIUM = [
		{ number: 29, bg: "#d4c4a0", dots: "#8b4a2c" },
		{ number: 74, bg: "#d8c8a8", dots: "#3a6a2c" },
		{ number: 45, bg: "#ccc0a0", dots: "#5a8040" },
		{ number: 16, bg: "#c5b090", dots: "#6a4a20" },
		{ number: 37, bg: "#d0c090", dots: "#4a7030" },
	];
	const ISHIHARA_PLATES_HARD = [
		{ number: 97, bg: "#c8be9e", dots: "#5a3a1a" },
		{ number: 26, bg: "#d2c4a2", dots: "#2a5a20" },
		{ number: 53, bg: "#cbbea0", dots: "#7a3010" },
		{ number: 81, bg: "#d5c8a8", dots: "#305825" },
		{ number: 64, bg: "#c9bfa0", dots: "#8a4a18" },
	];

	function getDifficultyPlates() {
		if (gameDifficulty === "easy") return ISHIHARA_PLATES_EASY;
		if (gameDifficulty === "medium") return ISHIHARA_PLATES_MEDIUM;
		return ISHIHARA_PLATES_HARD;
	}

	function getDifficultyTime() {
		if (gameDifficulty === "easy") return null;
		if (gameDifficulty === "medium") return 20;
		return 10;
	}

	function generateGameRound() {
		const plates = getDifficultyPlates();
		const plate = plates[Math.floor(Math.random() * plates.length)];
		setGameCurrentNumber(plate.number);
		setGameColors({ bg: plate.bg, dots: plate.dots, number: plate.number });
		setGameAnswer("");
		setGameFeedback(null);
		const timeLimit = getDifficultyTime();
		setGameTimeLeft(timeLimit);
		if (gameTimerRef.current) clearInterval(gameTimerRef.current);
		if (timeLimit) {
			gameTimerRef.current = setInterval(() => {
				setGameTimeLeft((prev) => {
					if (prev === null || prev <= 1) {
						if (gameTimerRef.current) clearInterval(gameTimerRef.current);
						setGameFeedback("wrong");
						setGameStreak(0);
						setTimeout(() => {
							setGameRound((r) => r + 1);
							generateGameRound();
						}, 1500);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
	}

	function startGame() {
		if (gameTimerRef.current) clearInterval(gameTimerRef.current);
		setGameActive(true);
		setGameScore(0);
		setGameStreak(0);
		setGameRound(1);
		generateGameRound();
	}

	function stopGame() {
		if (gameTimerRef.current) clearInterval(gameTimerRef.current);
		setGameActive(false);
		setGameTimeLeft(null);
	}

	function submitGameAnswer() {
		if (gameTimerRef.current) clearInterval(gameTimerRef.current);
		const userNum = parseInt(gameAnswer.trim(), 10);
		const diffBonus = gameDifficulty === "hard" ? 20 : gameDifficulty === "medium" ? 10 : 0;
		const timeBonus = gameTimeLeft ? gameTimeLeft * 2 : 0;
		if (userNum === gameCurrentNumber) {
			setGameFeedback("correct");
			setGameScore((s) => s + 10 + diffBonus + timeBonus + gameStreak * 3);
			setGameStreak((s) => s + 1);
		} else {
			setGameFeedback("wrong");
			setGameStreak(0);
		}
		setTimeout(() => {
			setGameRound((r) => r + 1);
			generateGameRound();
		}, 1500);
	}

	// Cleanup game timer on unmount
	React.useEffect(() => {
		return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current); };
	}, []);

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
			// Camera page commands when voice nav is active
			if (cmd.includes("open camera") || cmd.includes("start camera") || cmd.includes("camera on")) {
				setActivePage("camera");
				if (!cameraActive) startCamera();
			} else if (
				cmd.includes("take photo") || cmd.includes("capture") || cmd.includes("snap") ||
				cmd.includes("направи снимка") || cmd.includes("заснеми") || cmd.includes("снимка")
			) {
				setActivePage("camera");
				if (!cameraActive) {
					// Start camera then analyse after it's ready
					startCamera().then(() => {
						setTimeout(() => analyseCapture(), 800);
					});
				} else {
					analyseCapture();
				}
			} else if (
				cmd.includes("describe") || cmd.includes("what do you see") || cmd.includes("analyze image") ||
				cmd.includes("describe photo") || cmd.includes("describe picture") ||
				cmd.includes("опиши снимката") || cmd.includes("опиши")
			) {
				setActivePage("camera");
				if (capturedImage) {
					// Re-analyse the captured image
					analyseCapture();
				} else if (cameraActive) {
					analyseCapture();
				}
			} else if (cmd.includes("stop camera") || cmd.includes("close camera") || cmd.includes("camera off")) {
				stopCamera();
			} else if (
				cmd.includes("read") || cmd.includes("speak") || cmd.includes("play") ||
				cmd.includes("чети") || cmd.includes("прочети")
			) {
				const sel = window.getSelection()?.toString().trim();
				const textToRead = sel || sampleText;
				if (textToRead.trim()) {
					handleTtsStart(textToRead);
				} else {
					// Speak a helpful message if no text is loaded
					const utter = new SpeechSynthesisUtterance("Please load some text first, then say read.");
					utter.lang = "en-US";
					utter.volume = 1;
					speechSynthesis.speak(utter);
				}
			} else if (cmd.includes("stop") || cmd.includes("quiet") || cmd.includes("спри")) {
				speechSynthesis.cancel();
				setTtsActive(false);
				setTtsPaused(false);
				setHighlightRange(null);
			} else if (cmd.includes("pause") || cmd.includes("пауза")) {
				if (ttsPaused) {
					speechSynthesis.resume();
					setTtsPaused(false);
				} else {
					speechSynthesis.pause();
					setTtsPaused(true);
				}
			} else if (cmd.includes("resume") || cmd.includes("continue")) {
				speechSynthesis.resume();
				setTtsPaused(false);
			} else if (cmd.includes("dark mode") || cmd.includes("тъмен")) {
				setPrefs((p) => ({ ...p, theme: "dark" }));
			} else if (cmd.includes("high contrast") || cmd.includes("висок контраст")) {
				setPrefs((p) => ({ ...p, theme: "high-contrast" }));
			} else if (cmd.includes("light mode") || cmd.includes("default") || cmd.includes("светъл")) {
				setPrefs((p) => ({ ...p, theme: "default" }));
			} else if (cmd.includes("yellow") || cmd.includes("жълт")) {
				setPrefs((p) => ({ ...p, theme: "yellow-black" }));
			} else if (cmd.includes("magnif") || cmd.includes("лупа")) {
				setPrefs((p) => ({ ...p, magnifierEnabled: !p.magnifierEnabled }));
			} else if (cmd.includes("simplif") || cmd.includes("reading mode") || cmd.includes("режим четене")) {
				setPrefs((p) => ({ ...p, simplifiedReading: !p.simplifiedReading }));
			} else if (cmd.includes("larger") || cmd.includes("bigger") || cmd.includes("zoom in") || cmd.includes("по-голям")) {
				setPrefs((p) => ({ ...p, fontSize: Math.min(p.fontSize + 2, 64) }));
			} else if (cmd.includes("smaller") || cmd.includes("zoom out") || cmd.includes("по-малък")) {
				setPrefs((p) => ({ ...p, fontSize: Math.max(p.fontSize - 2, 12) }));
			} else if (cmd.includes("faster") || cmd.includes("speed up") || cmd.includes("по-бързо")) {
				setPrefs((p) => ({ ...p, ttsSpeed: Math.min(p.ttsSpeed + 0.25, 3) }));
			} else if (cmd.includes("slower") || cmd.includes("slow down") || cmd.includes("по-бавно")) {
				setPrefs((p) => ({ ...p, ttsSpeed: Math.max(p.ttsSpeed - 0.25, 0.5) }));
			} else if (cmd.includes("scroll down") || cmd.includes("down")) {
				window.scrollBy({ top: 300, behavior: "smooth" });
			} else if (cmd.includes("scroll up") || cmd.includes("up")) {
				window.scrollBy({ top: -300, behavior: "smooth" });
			} else if (cmd.includes("go home") || cmd.includes("home") || cmd.includes("начало")) {
				setActivePage("content");
			} else if (cmd.includes("go to camera") || cmd.includes("camera page")) {
				setActivePage("camera");
			} else if (cmd.includes("go to sign") || cmd.includes("sign language")) {
				setActivePage("signlanguage");
			} else if (cmd.includes("go to games") || cmd.includes("games")) {
				setActivePage("games");
			}
		},
		[handleTtsStart, sampleText, cameraActive, capturedImage, ttsPaused],
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
			setCameraActive(true);
			setCameraAnalysis("");
			setCapturedImage(null);
		} catch {
			setCameraAnalysis("Could not access camera. Please allow camera permissions.");
		}
	}

	// Attach stream to video element when camera becomes active
	React.useEffect(() => {
		if (cameraActive && videoRef.current && streamRef.current) {
			videoRef.current.srcObject = streamRef.current;
			videoRef.current.play().catch(() => {/* autoplay blocked */});
		}
	}, [cameraActive]);

	function stopCamera() {
		streamRef.current?.getTracks().forEach((t) => t.stop());
		streamRef.current = null;
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
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
			streamRef.current = null;
			if (videoRef.current) {
				videoRef.current.srcObject = null;
			}
		};
	}, []);

	// ── Video Recording ───────────────────────────────────────────────────────

	function startRecording() {
		if (!streamRef.current) return;
		recordedChunksRef.current = [];
		const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
		mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
		mr.onstop = () => {
			const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
			setRecordedVideoBlob(blob);
			setRecordedVideoUrl(URL.createObjectURL(blob));
		};
		mr.start();
		mediaRecorderRef.current = mr;
		setIsRecording(true);
		setRecordedVideoUrl(null);
		setRecordedVideoBlob(null);
		setVideoAnalysis("");
	}

	function stopRecording() {
		mediaRecorderRef.current?.stop();
		setIsRecording(false);
	}

	// ── Camera Q&A ────────────────────────────────────────────────────────────

	async function askAboutCapture() {
		if (!capturedImage || !cameraQuestion.trim()) return;
		setCameraAnalysing(true);
		setCameraAnalysis("");
		try {
			const result = await analyzeImageWithAI(capturedImage, cameraQuestion);
			setCameraAnalysis(result);
		} catch {
			setCameraAnalysis("Error answering question.");
		} finally {
			setCameraAnalysing(false);
		}
	}

	async function askAboutVideo() {
		if (!recordedVideoBlob || !videoQuestion.trim()) return;
		setVideoAnalysing(true);
		setVideoAnalysis("");
		// Extract a frame from the recorded video for analysis
		try {
			const url = URL.createObjectURL(recordedVideoBlob);
			const video = document.createElement("video");
			video.src = url;
			video.muted = true;
			await new Promise<void>((resolve) => {
				video.onloadeddata = () => resolve();
				video.load();
			});
			video.currentTime = Math.min(1, video.duration / 2);
			await new Promise<void>((resolve) => { video.onseeked = () => resolve(); });
			const canvas = document.createElement("canvas");
			canvas.width = video.videoWidth || 640;
			canvas.height = video.videoHeight || 480;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(video, 0, 0);
				const frame = canvas.toDataURL("image/jpeg", 0.85);
				const prompt = `[Video frame analysis] ${videoQuestion}`;
				const result = await analyzeImageWithAI(frame, prompt);
				setVideoAnalysis(result);
			}
			URL.revokeObjectURL(url);
		} catch {
			setVideoAnalysis("Error analysing video.");
		} finally {
			setVideoAnalysing(false);
		}
	}

	function startVoiceQuestionForCamera() {
		if (cameraQuestionListening) {
			cameraQuestionRecRef.current?.stop();
			setCameraQuestionListening(false);
			return;
		}
		const SR = (window as unknown as Record<string, unknown>).SpeechRecognition as (new () => {
			continuous: boolean; interimResults: boolean; lang: string;
			start: () => void; stop: () => void;
			onresult: ((e: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
			onerror: (() => void) | null; onend: (() => void) | null;
		}) | undefined || (window as unknown as Record<string, unknown>).webkitSpeechRecognition as (new () => {
			continuous: boolean; interimResults: boolean; lang: string;
			start: () => void; stop: () => void;
			onresult: ((e: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
			onerror: (() => void) | null; onend: (() => void) | null;
		}) | undefined;
		if (!SR) return;
		const rec = new SR();
		rec.continuous = false;
		rec.interimResults = false;
		rec.lang = prefs.ttsLanguage;
		rec.onresult = (e) => {
			const t = e.results[e.results.length - 1][0].transcript.trim();
			setCameraQuestion(t);
			setCameraQuestionListening(false);
		};
		rec.onerror = () => setCameraQuestionListening(false);
		rec.onend = () => setCameraQuestionListening(false);
		cameraQuestionRecRef.current = rec;
		rec.start();
		setCameraQuestionListening(true);
	}

	function startVoiceQuestionForVideo() {
		if (videoQuestionListening) {
			videoQuestionRecRef.current?.stop();
			setVideoQuestionListening(false);
			return;
		}
		const SR = (window as unknown as Record<string, unknown>).SpeechRecognition as (new () => {
			continuous: boolean; interimResults: boolean; lang: string;
			start: () => void; stop: () => void;
			onresult: ((e: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
			onerror: (() => void) | null; onend: (() => void) | null;
		}) | undefined || (window as unknown as Record<string, unknown>).webkitSpeechRecognition as (new () => {
			continuous: boolean; interimResults: boolean; lang: string;
			start: () => void; stop: () => void;
			onresult: ((e: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
			onerror: (() => void) | null; onend: (() => void) | null;
		}) | undefined;
		if (!SR) return;
		const rec = new SR();
		rec.continuous = false;
		rec.interimResults = false;
		rec.lang = prefs.ttsLanguage;
		rec.onresult = (e) => {
			const t = e.results[e.results.length - 1][0].transcript.trim();
			setVideoQuestion(t);
			setVideoQuestionListening(false);
		};
		rec.onerror = () => setVideoQuestionListening(false);
		rec.onend = () => setVideoQuestionListening(false);
		videoQuestionRecRef.current = rec;
		rec.start();
		setVideoQuestionListening(true);
	}

	// ── Sign Language Recognition ─────────────────────────────────────────────

	async function slStartCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: slFacingMode },
				audio: false,
			});
			slStreamRef.current = stream;
			setSlCameraActive(true);
			setSlRecognisedText("");
			setSlCapturedFrame(null);
		} catch {
			setSlRecognisedText("Could not access camera. Please allow camera permissions.");
		}
	}

	React.useEffect(() => {
		if (slCameraActive && slVideoRef.current && slStreamRef.current) {
			slVideoRef.current.srcObject = slStreamRef.current;
			slVideoRef.current.play().catch(() => {/* autoplay blocked */});
		}
	}, [slCameraActive]);

	function slStopCamera() {
		slStreamRef.current?.getTracks().forEach((t) => t.stop());
		slStreamRef.current = null;
		setSlCameraActive(false);
		if (slLiveMode) {
			setSlLiveMode(false);
			if (slLiveIntervalRef.current) clearInterval(slLiveIntervalRef.current);
		}
	}

	async function slCaptureAndRecognise() {
		const video = slVideoRef.current;
		const canvas = slCanvasRef.current;
		if (!video || !canvas || !slCameraActive) return;
		canvas.width = video.videoWidth || 640;
		canvas.height = video.videoHeight || 480;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
		setSlCapturedFrame(dataUrl);
		setSlAnalysing(true);
		try {
			const result = await analyzeImageWithAI(
				dataUrl,
				"This image shows a person using sign language / gesture language. Please recognize and transcribe the sign or signs shown. If you see a specific letter, word, phrase or sentence in sign language (such as ASL, BSL, or any other sign language), write it out in plain text. If you cannot determine a specific sign, describe the hand gesture in detail. Be concise and focus on what is being communicated.",
			);
			setSlRecognisedText(result);
			setSlTranscriptHistory((prev) => {
				const newEntry = result.trim();
				if (!newEntry || prev[prev.length - 1] === newEntry) return prev;
				return [...prev, newEntry].slice(-10);
			});
		} catch {
			setSlRecognisedText("Error recognising sign. Please try again.");
		} finally {
			setSlAnalysing(false);
		}
	}

	function slToggleLiveMode() {
		if (slLiveMode) {
			setSlLiveMode(false);
			if (slLiveIntervalRef.current) clearInterval(slLiveIntervalRef.current);
		} else {
			setSlLiveMode(true);
			slCaptureAndRecognise();
			slLiveIntervalRef.current = setInterval(() => {
				slCaptureAndRecognise();
			}, 4000);
		}
	}

	function slStartRecording() {
		if (!slStreamRef.current) return;
		slRecordedChunksRef.current = [];
		const mr = new MediaRecorder(slStreamRef.current, { mimeType: "video/webm" });
		mr.ondataavailable = (e) => { if (e.data.size > 0) slRecordedChunksRef.current.push(e.data); };
		mr.onstop = () => {
			const blob = new Blob(slRecordedChunksRef.current, { type: "video/webm" });
			setSlRecordedVideoBlob(blob);
			setSlRecordedVideoUrl(URL.createObjectURL(blob));
		};
		mr.start();
		slMediaRecorderRef.current = mr;
		setSlIsRecording(true);
		setSlRecordedVideoUrl(null);
		setSlRecordedVideoBlob(null);
	}

	function slStopRecording() {
		slMediaRecorderRef.current?.stop();
		setSlIsRecording(false);
	}

	async function slAnalyseVideo(blob: Blob) {
		setSlAnalysing(true);
		setSlRecognisedText("");
		try {
			const url = URL.createObjectURL(blob);
			const video = document.createElement("video");
			video.src = url;
			video.muted = true;
			await new Promise<void>((resolve) => { video.onloadeddata = () => resolve(); video.load(); });
			// Extract multiple frames for better sign language detection
			const frameTimes = [0.5, 1.0, 1.5, 2.0];
			const frames: string[] = [];
			for (const t of frameTimes) {
				if (t > video.duration) break;
				video.currentTime = t;
				await new Promise<void>((resolve) => { video.onseeked = () => resolve(); });
				const canvas = document.createElement("canvas");
				canvas.width = video.videoWidth || 640;
				canvas.height = video.videoHeight || 480;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(video, 0, 0);
					frames.push(canvas.toDataURL("image/jpeg", 0.8));
				}
			}
			URL.revokeObjectURL(url);
			if (frames.length === 0) {
				setSlRecognisedText("Could not extract frames from video.");
				return;
			}
			// Use first frame as primary, mention it's from video
			const result = await analyzeImageWithAI(
				frames[0],
				`This is a frame from a sign language video. Analyze the hand gestures and body language shown. Recognize and transcribe any sign language signs, letters, words or phrases you can identify. If this appears to be a sequence of signs, describe what is being communicated. Be concise and write the recognized text in plain language.`,
			);
			setSlRecognisedText(result);
			setSlTranscriptHistory((prev) => {
				const newEntry = result.trim();
				if (!newEntry) return prev;
				return [...prev, newEntry].slice(-10);
			});
		} catch {
			setSlRecognisedText("Error analysing video.");
		} finally {
			setSlAnalysing(false);
		}
	}

	async function slHandleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setSlUploadedVideoUrl(url);
		setSlUploadedVideoBlob(file);
		e.target.value = "";
		await slAnalyseVideo(file);
	}

	// Cleanup SL camera on unmount
	React.useEffect(() => {
		return () => {
			slStreamRef.current?.getTracks().forEach((t) => t.stop());
			if (slLiveIntervalRef.current) clearInterval(slLiveIntervalRef.current);
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
				onToggleMagnifier={() => setPrefs((p) => ({ ...p, magnifierEnabled: !p.magnifierEnabled }))}
				onToggleReading={() => setPrefs((p) => ({ ...p, simplifiedReading: !p.simplifiedReading }))}
				onFontIncrease={() => setPrefs((p) => ({ ...p, fontSize: Math.min(p.fontSize + 2, 64) }))}
				onFontDecrease={() => setPrefs((p) => ({ ...p, fontSize: Math.max(p.fontSize - 2, 12) }))}
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
					<li>&quot;Open camera&quot; / &quot;Start camera&quot; — activate camera</li>
					<li>&quot;Take photo&quot; / &quot;Capture&quot; — capture &amp; describe</li>
					<li>&quot;Stop camera&quot; — close camera</li>
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
												max={64}
												step={1}
												value={[prefs.fontSize]}
												onValueChange={([v]) => updatePref("fontSize", v)}
											/>
											<div className={cn("flex justify-between text-xs mt-1", themeSubText(t))}>
												<span>12px</span><span>38px</span><span>64px</span>
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
														Max Width: {Math.min(prefs.lineWidth, 850)}px
													</Label>
													<Slider
														id="line-width-sl"
														min={400}
														max={850}
														step={50}
														value={[Math.min(prefs.lineWidth, 850)]}
														onValueChange={([v]) => updatePref("lineWidth", Math.min(v, 850))}
													/>
													<div className={cn("flex justify-between text-xs mt-1", themeSubText(t))}>
														<span>400px</span><span>625px</span><span>850px</span>
													</div>
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
										{Object.entries(prefs.shortcuts).map(([action, shortcut]) => {
											const actionLabels: Record<string, string> = {
												tts: "Text-to-Speech",
												contrast: "Cycle Themes",
												magnifier: "Magnifier (Alt+M)",
												reading: "Reading Mode (Alt+R)",
												voiceNav: "Voice Navigation",
											};
											return (
												<div key={action} className="flex items-center justify-between gap-2">
													<Label className={cn("text-sm flex-1", themeText(t))}>
														{actionLabels[action] ?? action.replace(/([A-Z])/g, " $1")}
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
															"w-28 text-center text-xs font-mono border rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500",
															themeKbd(t),
														)}
														title="Click and press a key combination to change shortcut"
													/>
												</div>
											);
										})}
										<p className={cn("text-xs pt-2", themeSubText(t))}>Click a shortcut field and press a new key combination to customize it.</p>

									{/* Keyboard Reference merged here */}
									<div className={cn("pt-3 border-t mt-3", t === "dark" ? "border-gray-600" : t === "high-contrast" ? "border-gray-700" : t === "yellow-black" ? "border-black" : "border-gray-200")}>
										<p className={cn("text-xs font-semibold mb-2 uppercase tracking-wide", themeSubText(t))}>Quick Reference</p>
										<div className="space-y-1.5">
											{[
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
									</div>
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


					</aside>

					{/* ── Content Area ── */}
					<main id="main-content" className="lg:col-span-2 space-y-4" tabIndex={-1}>
						{/* Page Navigation — order: Content, AI Camera, Games */}
					<div className="flex gap-2 flex-wrap">
						<button
							type="button"
							onClick={() => setActivePage("content")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
								activePage === "content"
									? "bg-green-600 text-white border-green-700 shadow-md"
									: cn(
										"hover:border-green-300 hover:shadow-sm",
										t === "dark" && "bg-gray-800 border-gray-600 text-white",
										t === "high-contrast" && "bg-gray-900 border-white text-white",
										t === "yellow-black" && "bg-yellow-300 border-black text-black",
										t === "default" && "bg-white border-gray-200 text-gray-700",
									),
							)}
						>
							<FileText size={16} /> Content
						</button>
						<button
							type="button"
							onClick={() => setActivePage("camera")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
								activePage === "camera"
									? "bg-blue-600 text-white border-blue-700 shadow-md"
									: cn(
										"hover:border-blue-300 hover:shadow-sm",
										t === "dark" && "bg-gray-800 border-gray-600 text-white",
										t === "high-contrast" && "bg-gray-900 border-white text-white",
										t === "yellow-black" && "bg-yellow-300 border-black text-black",
										t === "default" && "bg-white border-gray-200 text-gray-700",
									),
							)}
						>
							<Camera size={16} /> AI Camera
						</button>
						<button
							type="button"
							onClick={() => setActivePage("games")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
								activePage === "games"
									? "bg-purple-600 text-white border-purple-700 shadow-md"
									: cn(
										"hover:border-purple-300 hover:shadow-sm",
										t === "dark" && "bg-gray-800 border-gray-600 text-white",
										t === "high-contrast" && "bg-gray-900 border-white text-white",
										t === "yellow-black" && "bg-yellow-300 border-black text-black",
										t === "default" && "bg-white border-gray-200 text-gray-700",
									),
							)}
						>
							<Gamepad2 size={16} /> Accessibility Games
						</button>
						<button
							type="button"
							onClick={() => setActivePage("signlanguage")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
								activePage === "signlanguage"
									? "bg-orange-600 text-white border-orange-700 shadow-md"
									: cn(
										"hover:border-orange-300 hover:shadow-sm",
										t === "dark" && "bg-gray-800 border-gray-600 text-white",
										t === "high-contrast" && "bg-gray-900 border-white text-white",
										t === "yellow-black" && "bg-yellow-300 border-black text-black",
										t === "default" && "bg-white border-gray-200 text-gray-700",
									),
							)}
						>
							<Hand size={16} /> Sign Language
						</button>
						<button
							type="button"
							onClick={() => setActivePage("about")}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
								activePage === "about"
									? "bg-indigo-600 text-white border-indigo-700 shadow-md"
									: cn(
										"hover:border-indigo-300 hover:shadow-sm",
										t === "dark" && "bg-gray-800 border-gray-600 text-white",
										t === "high-contrast" && "bg-gray-900 border-white text-white",
										t === "yellow-black" && "bg-yellow-300 border-black text-black",
										t === "default" && "bg-white border-gray-200 text-gray-700",
									),
							)}
						>
							<Sparkles size={16} /> About Claryx
						</button>
					</div>

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

						{/* Camera Page */}
						{activePage === "camera" && <section aria-labelledby="camera-heading">
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
										{cameraActive && !isRecording && (
											<Button
												size="sm"
												variant="outline"
												onClick={startRecording}
												className={cn(themeOutlineBtn(t))}
												title="Record video"
											>
												<span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:"#ef4444",marginRight:4}} />
												Record
											</Button>
										)}
										{cameraActive && isRecording && (
											<Button
												size="sm"
												onClick={stopRecording}
												className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
											>
												<Square size={14} className="mr-1" /> Stop Recording
											</Button>
										)}
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
									{capturedImage && (
										<div className={cn("rounded-xl p-3 mt-1 space-y-2 border", t === "dark" ? "bg-gray-800 border-gray-600" : t === "high-contrast" ? "bg-gray-900 border-gray-600" : t === "yellow-black" ? "bg-yellow-200 border-black" : "bg-gray-50 border-gray-200")}>
											<p className={cn("text-xs font-semibold", themeText(t))}>Ask a question about this photo:</p>
											<div className="flex gap-2">
												<input
													type="text"
													value={cameraQuestion}
													onChange={(e) => setCameraQuestion(e.target.value)}
													onKeyDown={(e) => { if (e.key === "Enter" && cameraQuestion.trim()) askAboutCapture(); }}
													placeholder="e.g. What color is the car?"
													className={cn(
														"flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
														t === "dark" && "bg-gray-700 border-gray-500 text-white placeholder:text-gray-400",
														t === "high-contrast" && "bg-black border-yellow-300 text-white",
														t === "yellow-black" && "bg-yellow-100 border-black text-black",
														t === "default" && "bg-white border-gray-300",
													)}
												/>
												<Button size="sm" variant={cameraQuestionListening ? "default" : "outline"}
													onClick={startVoiceQuestionForCamera}
													className={cn(!cameraQuestionListening && themeOutlineBtn(t), cameraQuestionListening && "bg-red-500 text-white animate-pulse")}
													title="Dictate question">
														{cameraQuestionListening ? <Mic size={14} /> : <MicOff size={14} />}
												</Button>
												<Button size="sm" onClick={askAboutCapture} disabled={!cameraQuestion.trim() || cameraAnalysing} className="bg-blue-600 hover:bg-blue-700 text-white">Ask</Button>
											</div>
										</div>
									)}

									{recordedVideoUrl && (
										<div className={cn("rounded-xl p-3 mt-1 space-y-2 border", t === "dark" ? "bg-gray-800 border-gray-600" : t === "high-contrast" ? "bg-gray-900 border-gray-600" : t === "yellow-black" ? "bg-yellow-200 border-black" : "bg-gray-50 border-gray-200")}>
											<p className={cn("text-xs font-semibold", themeText(t))}>Recorded video:</p>
											<video src={recordedVideoUrl} controls className="w-full max-h-40 rounded-lg" />
											<div className="flex gap-2 items-center">
												<a href={recordedVideoUrl} download="claryx-recording.webm" className={cn("text-xs px-3 py-1.5 rounded-md border font-medium inline-flex items-center gap-1", themeOutlineBtn(t))}>
													<Download size={12} /> Download
												</a>
											</div>
											<p className={cn("text-xs font-semibold", themeText(t))}>Ask a question about this video:</p>
											<div className="flex gap-2">
												<input
													type="text"
													value={videoQuestion}
													onChange={(e) => setVideoQuestion(e.target.value)}
													onKeyDown={(e) => { if (e.key === "Enter" && videoQuestion.trim()) askAboutVideo(); }}
													placeholder="e.g. What's happening in this video?"
													className={cn(
														"flex-1 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
														t === "dark" && "bg-gray-700 border-gray-500 text-white placeholder:text-gray-400",
														t === "high-contrast" && "bg-black border-yellow-300 text-white",
														t === "yellow-black" && "bg-yellow-100 border-black text-black",
														t === "default" && "bg-white border-gray-300",
													)}
												/>
												<Button size="sm" variant={videoQuestionListening ? "default" : "outline"}
													onClick={startVoiceQuestionForVideo}
													className={cn(!videoQuestionListening && themeOutlineBtn(t), videoQuestionListening && "bg-red-500 text-white animate-pulse")}
													title="Dictate question">
														{videoQuestionListening ? <Mic size={14} /> : <MicOff size={14} />}
												</Button>
												<Button size="sm" onClick={askAboutVideo} disabled={!videoQuestion.trim() || videoAnalysing} className="bg-blue-600 hover:bg-blue-700 text-white">Ask</Button>
											</div>
											{videoAnalysing && <p className={cn("text-sm animate-pulse", themeSubText(t))}>Analysing video frame…</p>}
											{videoAnalysis && (
												<div className={cn("rounded-lg p-2 text-sm", t === "dark" ? "bg-gray-700" : t === "high-contrast" ? "bg-gray-800" : t === "yellow-black" ? "bg-yellow-100" : "bg-blue-50")}>
													<p className={cn("font-semibold text-xs mb-1", themeSubText(t))}>AI answer:</p>
													<p className={themeText(t)}>{videoAnalysis}</p>
													<Button size="sm" variant="outline" className={cn("mt-1", themeOutlineBtn(t))} onClick={() => handleTtsStart(videoAnalysis)}><Volume2 size={12} className="mr-1" /> Read aloud</Button>
												</div>
											)}
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


							<section className="mt-4">
								<h3 className={cn("text-sm font-semibold mb-2", themeSubText(t))}>Features at a Glance</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									<FeatureCard icon={<Camera size={14} />} title="Live Camera" description="Stream from front or back camera." theme={t} />
									<FeatureCard icon={<Sparkles size={14} />} title="AI Describe" description="AI describes the scene in detail." theme={t} />
									<FeatureCard icon={<Eye size={14} />} title="Color Mode" description="Names every color for colorblind users." theme={t} />
									<FeatureCard icon={<ScanText size={14} />} title="Upload Image" description="Analyse any image or extract text." theme={t} />
									<FeatureCard icon={<Mic size={14} />} title="Voice Commands" description="Hands-free camera control." theme={t} />
									<FeatureCard icon={<Volume2 size={14} />} title="Read Results" description="TTS for all AI responses." theme={t} />
								</div>
							</section>
									<canvas ref={canvasRef} className="hidden" />
								</CardContent>
							</Card>
						</section>}

						{/* Games Page */}
						{activePage === "games" && <section aria-labelledby="games-heading">
							<h2 id="games-heading" className={cn("text-lg font-semibold mb-3 flex items-center gap-2", themeText(t))}>
								<Gamepad2 size={18} /> Accessibility Games
							</h2>
							<Card className={themeCard(t)}>
								<CardHeader>
									<CardTitle className={cn("text-base flex items-center gap-2", themeText(t))}>
										<Eye size={16} /> Color Blindness: Number Recognition
									</CardTitle>
									<p className={cn("text-xs mt-1", themeSubText(t))}>
										Identify numbers hidden in Ishihara-style color plates. Trains visual pattern recognition.
									</p>
								</CardHeader>
								<CardContent className="space-y-4">
									{!gameActive ? (
										<div className="text-center py-4 space-y-4">
											<div className={cn("text-sm", themeSubText(t))}>
												Each round shows a color plate &mdash; enter the number you see. Some plates are harder for colorblind users!
											</div>
											<div>
												<p className={cn("text-xs font-semibold mb-2 uppercase tracking-wide", themeSubText(t))}>Difficulty</p>
												<div className="flex justify-center gap-2">
													{(["easy","medium","hard"] as const).map((d) => (
														<button key={d} type="button"
															onClick={() => setGameDifficulty(d)}
															className={cn(
																"px-4 py-2 rounded-lg border text-sm font-semibold transition-all",
																gameDifficulty === d
																	? d === "easy" ? "bg-green-500 text-white border-green-600"
																		: d === "medium" ? "bg-orange-500 text-white border-orange-600"
																		: "bg-red-600 text-white border-red-700"
																	: cn("hover:border-gray-400", themeOutlineBtn(t)),
															)}
														>
															{d === "easy" ? "Easy" : d === "medium" ? "Medium ⏱20s" : "Hard ⏱10s"}
														</button>
													))}
												</div>
											</div>
											<Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700 text-white">
												<Gamepad2 size={14} className="mr-2" /> Start Game
											</Button>
										</div>
									) : (
										<div className="space-y-4">
											<div className="flex items-center justify-between flex-wrap gap-2">
												<div className="flex items-center gap-3">
													<span className={cn("text-sm font-semibold", themeText(t))}>Round {gameRound}</span>
													<span className={cn("flex items-center gap-1 text-sm", themeSubText(t))}>
														<Trophy size={14} /> {gameScore} pts
													</span>
													{gameStreak > 1 && (
														<span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-semibold">
															{gameStreak}x streak
														</span>
													)}
						{gameTimeLeft !== null && (
							<span className={cn("text-sm font-mono font-bold", gameTimeLeft <= 5 ? "text-red-500 animate-pulse" : "text-blue-500")}>
								⏱{gameTimeLeft}s
							</span>
						)}
						<span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", gameDifficulty === "easy" ? "bg-green-100 text-green-700" : gameDifficulty === "medium" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700")}>
							{gameDifficulty.toUpperCase()}
						</span>
												</div>
												<button
													type="button"
													onClick={() => stopGame()}
													className={cn("text-xs underline", themeSubText(t))}
												>
													End game
												</button>
											</div>

											<IshiharaPlate
												number={gameCurrentNumber}
												bgColor={gameColors.bg}
												dotColor={gameColors.dots}
												feedback={gameFeedback}
											/>

											{gameFeedback && (
												<div className={cn(
													"text-center text-sm font-semibold py-2 rounded-lg",
													gameFeedback === "correct"
														? cn("bg-green-100 text-green-700", t === "dark" && "bg-green-900 text-green-200", t === "high-contrast" && "bg-green-900 text-yellow-300")
														: cn("bg-red-100 text-red-700", t === "dark" && "bg-red-900 text-red-200", t === "high-contrast" && "bg-red-900 text-yellow-300"),
												)}>
													{gameFeedback === "correct"
														? ("Correct! The number was " + gameCurrentNumber)
														: ("Wrong - the number was " + gameCurrentNumber)}
												</div>
											)}

											{!gameFeedback && (
												<div className="flex gap-2">
													<input
														type="number"
														value={gameAnswer}
														onChange={(e) => setGameAnswer(e.target.value)}
														onKeyDown={(e) => { if (e.key === "Enter" && gameAnswer.trim()) submitGameAnswer(); }}
														placeholder="Type the number you see..."
														className={cn(
															"flex-1 text-sm border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
															t === "dark" && "bg-gray-700 border-gray-500 text-white placeholder:text-gray-400",
															t === "high-contrast" && "bg-black border-yellow-300 text-white",
															t === "yellow-black" && "bg-yellow-200 border-black text-black",
															t === "default" && "bg-white border-gray-300",
														)}
														aria-label="Enter the number you see in the color plate"
													/>
													<Button
														onClick={submitGameAnswer}
														disabled={!gameAnswer.trim()}
														className="bg-purple-600 hover:bg-purple-700 text-white"
													>
														Submit
													</Button>
													<Button
														variant="outline"
														onClick={generateGameRound}
														className={themeOutlineBtn(t)}
														title="Skip this round"
													>
														<RefreshCw size={14} />
													</Button>
												</div>
											)}

											<p className={cn("text-xs", themeSubText(t))}>
												Tip: Look for a number formed by the colored dots. People with color vision deficiencies may find certain plates harder.
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						<section className="mt-4">
							<h3 className={cn("text-sm font-semibold mb-2", themeSubText(t))}>Features at a Glance</h3>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
								<FeatureCard icon={<Gamepad2 size={14} />} title="Ishihara Game" description="Identify numbers hidden in color plates." theme={t} />
								<FeatureCard icon={<Trophy size={14} />} title="Score & Streaks" description="Earn bonus points for correct streaks." theme={t} />
								<FeatureCard icon={<BarChart2 size={14} />} title="3 Difficulty Levels" description="Easy (no timer), Medium (20s), Hard (10s)." theme={t} />
								<FeatureCard icon={<Eye size={14} />} title="Colorblind Training" description="Builds visual pattern recognition." theme={t} />
								<FeatureCard icon={<RefreshCw size={14} />} title="Skip Round" description="Skip and try a different plate." theme={t} />
								<FeatureCard icon={<Sparkles size={14} />} title="Time Bonus" description="Faster correct answers earn more points." theme={t} />
							</div>
						</section>
						</section>}

					{/* Sign Language Page */}
				{activePage === "signlanguage" && <section aria-labelledby="sl-heading">
					<h2 id="sl-heading" className={cn("text-lg font-semibold mb-3 flex items-center gap-2", themeText(t))}>
						<Hand size={18} /> Sign Language Recognition
					</h2>
					<Card className={themeCard(t)}>
						<CardContent className="pt-4 space-y-4">
							{/* Controls */}
							<div className="flex flex-wrap gap-2">
								{!slCameraActive ? (
									<Button size="sm" onClick={slStartCamera} className="bg-orange-600 hover:bg-orange-700 text-white">
										<Camera size={14} className="mr-1" /> Start Camera
									</Button>
								) : (
									<Button size="sm" variant="outline" onClick={slStopCamera} className={themeOutlineBtn(t)}>
										<CameraOff size={14} className="mr-1" /> Stop Camera
									</Button>
								)}
								{slCameraActive && (
									<>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												const next = slFacingMode === "user" ? "environment" : "user";
												setSlFacingMode(next);
												slStopCamera();
												setSlCameraActive(false);
												setTimeout(async () => {
													try {
														const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: next }, audio: false });
														slStreamRef.current = s;
														if (slVideoRef.current) { slVideoRef.current.srcObject = s; slVideoRef.current.play(); }
														setSlCameraActive(true);
													} catch { /* ignore */ }
												}, 300);
											}}
											className={themeOutlineBtn(t)}
										>
											<FlipHorizontal size={14} className="mr-1" /> Flip
										</Button>
										<Button
											size="sm"
											onClick={slCaptureAndRecognise}
											disabled={slAnalysing}
											className="bg-orange-500 hover:bg-orange-600 text-white"
										>
											<Hand size={14} className="mr-1" />
											{slAnalysing ? "Recognising…" : "Recognise Sign"}
										</Button>
										<Button
											size="sm"
											variant={slLiveMode ? "default" : "outline"}
											onClick={slToggleLiveMode}
											className={cn(!slLiveMode && themeOutlineBtn(t), slLiveMode && "bg-green-600 text-white animate-pulse")}
										>
											<Video size={14} className="mr-1" /> {slLiveMode ? "Live ON" : "Live Mode"}
										</Button>
										{!slIsRecording ? (
											<Button size="sm" variant="outline" onClick={slStartRecording} className={themeOutlineBtn(t)}>
												<span style={{display:"inline-block",width:10,height:10,borderRadius:"50%",background:"#ef4444",marginRight:4}} />
												Record
											</Button>
										) : (
											<Button size="sm" onClick={slStopRecording} className="bg-red-600 hover:bg-red-700 text-white animate-pulse">
												<Square size={14} className="mr-1" /> Stop Rec
											</Button>
										)}
									</>
								)}
								{/* Upload video */}
								<label className={cn("cursor-pointer inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-md border font-medium transition-colors", themeOutlineBtn(t))}>
									<Upload size={14} /> Upload Video
									<input type="file" accept="video/*" className="hidden" onChange={slHandleVideoUpload} />
								</label>
							</div>

							{/* Info banner */}
							<div className={cn("text-xs px-3 py-2 rounded-lg", t === "dark" ? "bg-orange-900 text-orange-200" : t === "high-contrast" ? "bg-orange-900 text-yellow-300 border border-yellow-300" : t === "yellow-black" ? "bg-yellow-200 border-black text-black border" : "bg-orange-50 text-orange-700 border border-orange-200")}>
								<Hand size={12} className="inline mr-1" />
								<strong>How to use:</strong> Start the camera and show a sign language gesture. Click <em>Recognise Sign</em> to capture a frame and have AI translate it. Use <em>Live Mode</em> for continuous recognition every 4 seconds, or <em>Record</em> a video then analyse it. You can also upload a pre-recorded sign language video.
							</div>

							{/* Live camera feed */}
							{slCameraActive && (
								<div className="relative">
									<div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-72">
										<video
											ref={slVideoRef}
											className="w-full h-full object-contain"
											autoPlay
											playsInline
											muted
										/>
										{slLiveMode && (
											<div className="absolute top-2 left-2 flex items-center gap-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
												<span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block" />
												LIVE
											</div>
										)}
										{slIsRecording && (
											<div className="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
												<span className="w-2 h-2 bg-white rounded-full inline-block" />
												REC
											</div>
										)}
									</div>
								</div>
							)}

							{/* Captured frame preview */}
							{slCapturedFrame && (
								<div className="space-y-1">
									<p className={cn("text-xs font-medium", themeSubText(t))}>Last captured frame:</p>
									<img src={slCapturedFrame} alt="Captured sign language frame" className="rounded-xl max-h-36 object-contain border" />
								</div>
							)}

							{/* Recorded video */}
							{slRecordedVideoUrl && (
								<div className={cn("rounded-xl p-3 space-y-2 border", t === "dark" ? "bg-gray-800 border-gray-600" : t === "high-contrast" ? "bg-gray-900 border-gray-600" : t === "yellow-black" ? "bg-yellow-200 border-black" : "bg-gray-50 border-gray-200")}>
									<p className={cn("text-xs font-semibold", themeText(t))}>Recorded video:</p>
									<video src={slRecordedVideoUrl} controls className="w-full max-h-40 rounded-lg" />
									<div className="flex gap-2 flex-wrap">
										<a href={slRecordedVideoUrl} download="sign-language.webm" className={cn("text-xs px-3 py-1.5 rounded-md border font-medium inline-flex items-center gap-1", themeOutlineBtn(t))}>
											<Download size={12} /> Download
										</a>
										{slRecordedVideoBlob && (
											<Button size="sm" onClick={() => slRecordedVideoBlob && slAnalyseVideo(slRecordedVideoBlob)} disabled={slAnalysing} className="bg-orange-600 hover:bg-orange-700 text-white">
												<Sparkles size={14} className="mr-1" /> {slAnalysing ? "Analysing…" : "Analyse Recording"}
											</Button>
										)}
									</div>
								</div>
							)}

							{/* Uploaded video */}
							{slUploadedVideoUrl && (
								<div className={cn("rounded-xl p-3 space-y-2 border", t === "dark" ? "bg-gray-800 border-gray-600" : t === "high-contrast" ? "bg-gray-900 border-gray-600" : t === "yellow-black" ? "bg-yellow-200 border-black" : "bg-gray-50 border-gray-200")}>
									<p className={cn("text-xs font-semibold", themeText(t))}>Uploaded video:</p>
									<video src={slUploadedVideoUrl} controls className="w-full max-h-40 rounded-lg" />
									{slUploadedVideoBlob && (
										<Button size="sm" onClick={() => slUploadedVideoBlob && slAnalyseVideo(slUploadedVideoBlob)} disabled={slAnalysing} className="bg-orange-600 hover:bg-orange-700 text-white">
											<Sparkles size={14} className="mr-1" /> {slAnalysing ? "Analysing…" : "Re-analyse"}
										</Button>
									)}
								</div>
							)}

							{/* Analysing indicator */}
							{slAnalysing && (
								<div className={cn("text-sm animate-pulse", themeSubText(t))}>
									Analysing sign language with AI…
								</div>
							)}

							{/* Recognition result */}
							{slRecognisedText && !slAnalysing && (
								<div className={cn("rounded-xl p-4 space-y-2", t === "dark" ? "bg-orange-900 border border-orange-700" : t === "high-contrast" ? "bg-gray-900 border border-yellow-300" : t === "yellow-black" ? "bg-yellow-200 border-2 border-black" : "bg-orange-50 border border-orange-200")}>
									<div className="flex items-center gap-2 mb-1">
										<Type size={16} className={t === "dark" ? "text-orange-300" : t === "high-contrast" ? "text-yellow-300" : "text-orange-600"} />
										<p className={cn("text-xs font-semibold uppercase tracking-wide", themeSubText(t))}>AI Recognition Result:</p>
									</div>
									<p className={cn("text-base leading-relaxed", themeText(t))}>{slRecognisedText}</p>
									<Button size="sm" variant="outline" className={cn("mt-1", themeOutlineBtn(t))} onClick={() => handleTtsStart(slRecognisedText)}>
										<Volume2 size={12} className="mr-1" /> Read aloud
									</Button>
								</div>
							)}

							{/* Transcript history */}
							{slTranscriptHistory.length > 1 && (
								<div className={cn("rounded-xl p-3 space-y-2 border", t === "dark" ? "bg-gray-800 border-gray-600" : t === "high-contrast" ? "bg-gray-900 border-gray-600" : t === "yellow-black" ? "bg-yellow-100 border-black" : "bg-gray-50 border-gray-200")}>
									<div className="flex items-center justify-between">
										<p className={cn("text-xs font-semibold", themeSubText(t))}>Transcript history ({slTranscriptHistory.length} results):</p>
										<button type="button" onClick={() => setSlTranscriptHistory([])} className={cn("text-xs underline", themeSubText(t))}>Clear</button>
									</div>
									<div className="space-y-1 max-h-48 overflow-y-auto">
										{slTranscriptHistory.map((entry, i) => (
											<div key={i} className={cn("text-xs px-2 py-1 rounded border-l-2 border-orange-400", t === "dark" ? "bg-gray-700 text-gray-200" : t === "high-contrast" ? "bg-gray-800 text-yellow-300" : t === "yellow-black" ? "bg-yellow-200 text-black" : "bg-white text-gray-700")}>
												<span className={cn("font-mono text-xs mr-2", themeSubText(t))}>#{i + 1}</span>{entry}
											</div>
										))}
									</div>
									<Button size="sm" variant="outline" className={cn(themeOutlineBtn(t))} onClick={() => handleTtsStart(slTranscriptHistory.join(" "))}>
										<Volume2 size={12} className="mr-1" /> Read full transcript
									</Button>
								</div>
							)}

							<canvas ref={slCanvasRef} className="hidden" />
						</CardContent>
					</Card>

					<section className="mt-4">
						<h3 className={cn("text-sm font-semibold mb-2", themeSubText(t))}>Features at a Glance</h3>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							<FeatureCard icon={<Hand size={14} />} title="Sign Recognition" description="AI recognises hand gestures in real time." theme={t} />
							<FeatureCard icon={<Video size={14} />} title="Video Upload" description="Upload any sign language video for analysis." theme={t} />
							<FeatureCard icon={<Camera size={14} />} title="Live Camera" description="Use front or back camera for gestures." theme={t} />
							<FeatureCard icon={<Sparkles size={14} />} title="Live Mode" description="Continuous recognition every 4 seconds." theme={t} />
							<FeatureCard icon={<Type size={14} />} title="Text Output" description="Signs translated to written text." theme={t} />
							<FeatureCard icon={<Volume2 size={14} />} title="Read Aloud" description="TTS reads the recognised signs." theme={t} />
						</div>
					</section>
				</section>}

				{/* Content Page */}
					{activePage === "content" && <section aria-labelledby="demo-heading">
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
										onClick={() => {
											if (ttsActive) {
												handleTtsStop();
											} else {
												const text = sampleText.trim();
												if (text) handleTtsStart(text);
											}
										}}
										className={cn(!ttsActive && themeOutlineBtn(t))}
									>
										<Volume2 size={14} className="mr-1" />
										{ttsActive ? "Stop" : "Read Aloud"}
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
								style={prefs.simplifiedReading ? { maxWidth: "850px" } : undefined}
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
											style={{ ...contentStyle, resize: "none" }}
											className={cn(
												"h-64 overflow-y-auto w-full",
												"[&::-webkit-scrollbar]:w-2",
												"[&::-webkit-scrollbar-track]:rounded-full",
												t === "dark" && "[&::-webkit-scrollbar-track]:bg-gray-600 [&::-webkit-scrollbar-thumb]:bg-gray-400",
												t === "high-contrast" && "[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:bg-yellow-400",
												t === "yellow-black" && "[&::-webkit-scrollbar-track]:bg-yellow-300 [&::-webkit-scrollbar-thumb]:bg-black",
												(t === "default") && "[&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400",
												"[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2",
												t === "dark" && "bg-gray-700 border-gray-500 text-white placeholder:text-gray-400",
												t === "high-contrast" && "bg-black border-yellow-300 text-white placeholder:text-gray-400",
												t === "yellow-black" && "bg-yellow-200 border-black text-black placeholder:text-gray-600",
											)}
											placeholder="Type or paste text here…"
											aria-label="Editable sample text"
										/>
										{/* Highlight-as-read: shows context window with current word highlighted */}
										{prefs.highlightAsRead && ttsActive && highlightRange && (
											<div
												aria-live="polite"
												aria-label="Currently reading"
												className={cn(
													"mt-2 rounded-lg px-3 py-2 text-sm border break-words",
													t === "dark" && "bg-gray-800 border-blue-500 text-white",
													t === "high-contrast" && "bg-black border-yellow-300 text-white",
													t === "yellow-black" && "bg-yellow-100 border-black text-black",
													t === "default" && "bg-blue-50 border-blue-300 text-gray-900",
												)}
												style={{ fontSize: `${prefs.fontSize}px`, lineHeight: prefs.lineSpacing, maxHeight: "120px", overflowY: "auto" }}
											>
												<span style={{ opacity: 0.45 }}>
													{sampleText.slice(Math.max(0, highlightRange.start - 80), highlightRange.start)}
												</span>
												<span style={{
													background: t === "high-contrast" ? "rgba(250,204,21,0.9)" : t === "dark" ? "rgba(59,130,246,0.5)" : t === "yellow-black" ? "rgba(0,0,0,0.2)" : "rgba(253,224,71,0.8)",
													borderRadius: "3px",
													padding: "0 2px",
													fontWeight: 700,
												}}>
													{sampleText.slice(highlightRange.start, highlightRange.end)}
												</span>
												<span style={{ opacity: 0.45 }}>
													{sampleText.slice(highlightRange.end, Math.min(sampleText.length, highlightRange.end + 80))}
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

					<section className="mt-4">
						<h3 className={cn("text-sm font-semibold mb-2", themeSubText(t))}>Features at a Glance</h3>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							<FeatureCard icon={<FileText size={14} />} title="File Import" description="PDF, DOCX, TXT, images." theme={t} />
							<FeatureCard icon={<Sparkles size={14} />} title="AI Summary" description="Summarise long text in one click." theme={t} />
							<FeatureCard icon={<Volume2 size={14} />} title="Text-to-Speech" description="Read aloud with natural voice." theme={t} />
							<FeatureCard icon={<PenLine size={14} />} title="Annotations" description="Highlight selections and add notes." theme={t} />
							<FeatureCard icon={<Download size={14} />} title="Export" description="Save text as .txt file." theme={t} />
							<FeatureCard icon={<Languages size={14} />} title="Auto-detect Language" description="Detect text language automatically." theme={t} />
						</div>
					</section>
						</section>}

					{/* About Claryx Page */}
					{activePage === "about" && (
						<section aria-labelledby="about-heading" className="space-y-6">
							<div className="flex items-center gap-3 mb-2">
								<Sparkles size={24} className={cn(t === "high-contrast" ? "text-yellow-300" : t === "dark" ? "text-indigo-400" : "text-indigo-600")} />
								<h2 id="about-heading" className={cn("text-2xl font-bold tracking-tight", themeText(t))}>About Claryx</h2>
							</div>

							{[
								{
									title: "Inspiration",
									content: "We built Claryx because accessibility on the web is still an afterthought for too many people. Every day, millions of users with visual impairments, reading difficulties, motor disabilities, or cognitive differences struggle with content that simply wasn't designed with them in mind. We wanted to change that — not with a narrow single-feature tool, but with a comprehensive, all-in-one platform that actually meets people where they are. The name Claryx comes from clarity — the goal of making information clear, readable, and reachable for everyone, regardless of ability.",
								},
								{
									title: "What it does",
									content: "Claryx is an accessibility hub that brings together a wide range of assistive tools in a single, cohesive interface. Users can listen to any text read aloud with natural-sounding voices and multi-language support, import documents (PDF, DOCX, TXT, and images via OCR), and get AI-powered summaries of long content. The platform offers adaptive display modes — high contrast, dark mode, yellow-on-black — alongside adjustable font size, line spacing, and a distraction-free reading layout. A magnifier follows the cursor for low-vision users, while voice navigation lets users control the interface hands-free. For users with color vision deficiency, Claryx includes an Ishihara-style colorblind game for awareness and testing. A sign language recognition module captures live video and transcribes signed input. Annotations let users highlight and annotate any text passage, and everything can be exported as a plain-text file.",
								},
								{
									title: "How we built it",
									content: "Claryx is built on React 19 with TypeScript, using TanStack Router for file-based routing and TanStack Query for server-state management. The UI is composed of Tailwind CSS v4 and shadcn/ui components styled for every accessibility theme. Text-to-speech is powered by the Web Speech API with custom word-boundary tracking for real-time highlighting. Voice navigation uses the SpeechRecognition API. File parsing leverages pdfjs-dist for PDFs and Mammoth for DOCX files, while image OCR and AI summarization are handled through the OpenAI GPT Vision API. The colorblind game renders procedurally generated Ishihara-style SVG plates. Sign language capture uses the MediaRecorder API combined with vision-based frame analysis.",
								},
								{
									title: "Challenges we ran into",
									content: "Voice APIs vary significantly across browsers — Chrome, Firefox, and Safari each expose speech synthesis voices differently and at different lifecycle moments, requiring careful async initialization. Getting the camera to release properly when switching pages was tricky: stopping all MediaStream tracks is not enough if the video element still holds a reference to the stream. Multi-language TTS required detecting the language of pasted or uploaded text before selecting an appropriate voice, which needed both heuristic detection and graceful fallbacks. Rendering accessible, high-contrast Ishihara plates in SVG while maintaining the visual complexity needed to challenge users took multiple iterations. Balancing the breadth of features with a clean, non-overwhelming UI was an ongoing design challenge throughout the hackathon.",
								},
								{
									title: "Accomplishments that we're proud of",
									content: "We're proud that Claryx is not a demo — it's a fully working accessibility platform built end-to-end during the hackathon. Every feature functions with real user input: actual PDF parsing, real voice synthesis, live camera OCR, and a genuinely playable colorblind game with difficulty levels and scoring. We shipped multi-language TTS with automatic language detection, a keyboard-shortcut system, a draggable floating toolbar, four distinct accessibility themes, and a persistent annotation system — all in a single cohesive interface. We're especially proud of how the different tools complement each other rather than feeling bolted together.",
								},
								{
									title: "What we learned",
									content: "We learned how deep the browser accessibility APIs go — and how inconsistently they are implemented. The Web Speech API alone required us to handle a dozen edge cases around voice loading, utterance queuing, pause/resume behavior, and cross-browser quirks. We also learned that good accessibility is fundamentally about respecting user agency: giving people control over fonts, contrast, speed, language, and layout — not making those decisions for them. Building for accessibility from day one changes how you think about every UI decision, from color choices to focus management to ARIA roles.",
								},
								{
									title: "What's next for Claryx",
									content: "We plan to expand Claryx with persistent user profiles so that preferences — themes, voice settings, font sizes, shortcuts — are saved across sessions. We want to add real-time collaborative annotation so teachers and students can work with the same document together. The sign language module will be extended with a full model-backed recognition pipeline. We're also exploring browser-extension packaging so Claryx's tools can be applied to any webpage, not just uploaded content. Long term, we envision Claryx as an open platform where accessibility plugins can be contributed by the community.",
								},
							].map(({ title, content }) => (
								<Card key={title} className={cn(themeCard(t))}>
									<CardHeader className="pb-2">
										<CardTitle className={cn("text-base font-semibold", themeText(t))}>
											## {title}
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className={cn("text-sm leading-relaxed", themeSubText(t))}>{content}</p>
									</CardContent>
								</Card>
							))}
						</section>
					)}

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

	return (
		<div
			aria-hidden="true"
			data-magnifier="true"
			style={{
				position: "fixed",
				zIndex: 9998,
				left: x - half,
				top: y - half,
				width: size,
				height: size,
				borderRadius: "50%",
				border: "3px solid #3b82f6",
				boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
				overflow: "hidden",
				pointerEvents: "none",
			}}
		>
			{/* Use a scaled clone of the body via CSS transform */}
			<MagnifiedFrame x={x} y={y} zoom={zoom} size={size} />
			{/* Crosshair */}
			<div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
				<div style={{ position: "absolute", left: half - 0.5, top: 0, bottom: 0, width: 1, background: "rgba(59,130,246,0.4)" }} />
				<div style={{ position: "absolute", top: half - 0.5, left: 0, right: 0, height: 1, background: "rgba(59,130,246,0.4)" }} />
			</div>
			{/* Zoom badge */}
			<div style={{
				position: "absolute", bottom: 6, right: 10, fontSize: 10, fontWeight: 700,
				color: "#3b82f6", fontFamily: "monospace", background: "rgba(255,255,255,0.85)",
				borderRadius: 3, padding: "1px 4px", zIndex: 3, pointerEvents: "none",
			}}>
				{zoom}×
			</div>
		</div>
	);
}

function MagnifiedFrame({ x, y, zoom, size }: { x: number; y: number; zoom: number; size: number }) {
	const containerRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Clone the entire body except for the magnifier itself
		const bodyClone = document.body.cloneNode(true) as HTMLElement;
		// Remove the magnifier from the clone to prevent infinite recursion
		const magnifiers = bodyClone.querySelectorAll("[data-magnifier]");
		magnifiers.forEach((el) => el.remove());

		// Apply all computed styles
		bodyClone.style.margin = "0";
		bodyClone.style.padding = "0";
		bodyClone.style.overflow = "hidden";
		bodyClone.style.width = `${window.innerWidth}px`;
		bodyClone.style.height = `${window.innerHeight}px`;
		bodyClone.style.position = "absolute";
		bodyClone.style.top = "0";
		bodyClone.style.left = "0";
		bodyClone.style.transform = `scale(${zoom})`;
		bodyClone.style.transformOrigin = "0 0";
		// Offset so the cursor position maps to the center of the lens
		const half = size / 2;
		const offsetX = -(x * zoom - half);
		const offsetY = -(y * zoom - half);
		bodyClone.style.marginLeft = `${offsetX}px`;
		bodyClone.style.marginTop = `${offsetY}px`;
		bodyClone.style.pointerEvents = "none";

		container.innerHTML = "";
		container.appendChild(bodyClone);

		return () => {
			container.innerHTML = "";
		};
	}, [x, y, zoom, size]);

	return (
		<div
			ref={containerRef}
			style={{
				width: size,
				height: size,
				overflow: "hidden",
				position: "relative",
			}}
		/>
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

// --- IshiharaPlate ---

interface IshiharaPlateProps {
	number: number;
	bgColor: string;
	dotColor: string;
	feedback: "correct" | "wrong" | null;
}

function IshiharaPlate({ number, bgColor, dotColor, feedback }: IshiharaPlateProps) {
	const size = 280;
	const radius = size / 2;

	const dots = React.useMemo(() => {
		const result: { x: number; y: number; r: number; isNumber: boolean }[] = [];
		let seed = number * 9301 + 49297;
		function rand() {
			seed = (seed * 9301 + 49297) % 233280;
			return seed / 233280;
		}
		for (let i = 0; i < 180; i++) {
			const angle = rand() * Math.PI * 2;
			const dist = Math.sqrt(rand()) * (radius - 14);
			const x = radius + Math.cos(angle) * dist;
			const y = radius + Math.sin(angle) * dist;
			const r = 6 + rand() * 8;
			result.push({ x, y, r, isNumber: false });
		}
		const digits = String(number).split("").map(Number);
		const bitmaps: Record<number, number[][]> = {
			0: [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
			1: [[0,1,0],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
			2: [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
			3: [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
			4: [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
			5: [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
			6: [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
			7: [[1,1,1],[0,0,1],[0,0,1],[0,0,1],[0,0,1]],
			8: [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
			9: [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
		};
		const totalWidth = digits.length * 28 + (digits.length - 1) * 6;
		let startX = (size - totalWidth) / 2;
		const startY = (size - 50) / 2;
		for (const digit of digits) {
			const bitmap = bitmaps[digit] ?? bitmaps[0];
			for (let row = 0; row < 5; row++) {
				for (let col = 0; col < 3; col++) {
					if (bitmap[row][col]) {
						result.push({ x: startX + col * 10 + 5, y: startY + row * 10 + 5, r: 7, isNumber: true });
					}
				}
			}
			startX += 34;
		}
		return result;
	}, [number, radius]);

	const outline = feedback === "correct" ? "#22c55e" : feedback === "wrong" ? "#ef4444" : "#94a3b8";

	return (
		<div className="flex justify-center">
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				aria-label="Color plate containing a hidden number"
				role="img"
				style={{ borderRadius: "50%", border: `3px solid ${outline}`, display: "block" }}
			>
				<circle cx={radius} cy={radius} r={radius} fill={bgColor} />
				{dots.map((dot, i) => (
					<circle
						key={i}
						cx={dot.x}
						cy={dot.y}
						r={dot.r}
						fill={dot.isNumber ? dotColor : bgColor}
						opacity={dot.isNumber ? 0.95 : 0.65}
						stroke={dot.isNumber ? dotColor : "none"}
						strokeWidth={dot.isNumber ? 1 : 0}
					/>
				))}
			</svg>
		</div>
	);
}
