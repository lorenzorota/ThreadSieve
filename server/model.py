# based on https://huggingface.co/SuperAnnotate/ai-detector

from generated_text_detector.utils.model.roberta_classifier import RobertaClassifier
from generated_text_detector.utils.preprocessing import preprocessing_text
from transformers import AutoTokenizer
import torch
import torch.nn.functional as F

if torch.backends.mps.is_available():
    device = torch.device("mps")  # Apple Silicon (MPS)
elif torch.cuda.is_available():
    device = torch.device("cuda")  # NVIDIA GPU (CUDA)
else:
    device = torch.device("cpu")  # Fallback to CPU

print(f"Using device: {device}")

_model = RobertaClassifier.from_pretrained("SuperAnnotate/ai-detector").to(device)
tokenizer = AutoTokenizer.from_pretrained("SuperAnnotate/ai-detector")

_model.eval()

def model(text):
    preprocessing_text(text)

    tokens = tokenizer.encode_plus(
       text,
       add_special_tokens=True,
       max_length=512,
       padding="longest",
       truncation=True,
       return_token_type_ids=True,
       return_tensors="pt"
    )

    tokens = {key: value.to(device) for key, value in tokens.items()}

    _, logits = _model(**tokens)

    proba = F.sigmoid(logits).squeeze(1).item()

    return proba > 0.5

if __name__ == "__main__":
    print(model("This is a test string"))
    print(model("In a quiet corner of the cosmos, where stardust swirled like whispers in the night, a curious traveler named Kora stumbled upon an ancient machine buried beneath the surface of a forgotten moon. The device hummed softly, its core glowing faintly with a cerulean light. Intrigued, Kora touched its surface, and the machine responded with a projection of maps, languages, and stories from civilizations long lost to time."))
    print(model("This was not written by a bot!"))