import os
from agents.agent import Agent
from agents.deep_neural_network import DeepNeuralNetworkInference

WEIGHTS_FILENAME = "deep_neural_network.pth"
WEIGHTS_DOWNLOAD_URL = "https://drive.google.com/drive/folders/1uq5C9edPIZ1973dArZiEO-VE13F7m8MK?usp=drive_link"


class NeuralNetworkAgent(Agent):
    name = "Neural Network Agent"
    color = Agent.MAGENTA

    def __init__(self):
        """
        Initialize this object by loading in the saved model weights
        and the SentenceTransformer vector encoding model
        """
        self.log("Neural Network Agent is initializing")
        self.neural_network = DeepNeuralNetworkInference()
        self.neural_network.setup()
        weights_path = os.path.join(os.path.dirname(__file__), "..", WEIGHTS_FILENAME)
        if not os.path.isfile(WEIGHTS_FILENAME) and not os.path.isfile(weights_path):
            raise FileNotFoundError(
                f"Khong tim thay file trong so '{WEIGHTS_FILENAME}'. "
                f"Day la file trong so da huan luyen san (khong nam trong repo git). "
                f"Hay tai ve tu {WEIGHTS_DOWNLOAD_URL} va dat vao thu muc 'week8' "
                f"(cung cap voi day5.ipynb) roi chay lai."
            )
        self.neural_network.load(WEIGHTS_FILENAME)
        self.log("Neural Network Agent is ready and weights are loaded")

    def price(self, description: str) -> float:
        """
        Use the Deep Neural Network to estimate the price of the described item
        :param description: the product to be estimated
        :return: the price as a float
        """
        self.log("Neural Network Agent is starting a prediction")
        result = self.neural_network.inference(description)
        self.log(f"Neural Network Agent completed - predicting ${result:.2f}")
        return result
