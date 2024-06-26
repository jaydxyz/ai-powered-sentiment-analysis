    async function loadModel() {
      const encoder = await use.load();
      const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json');
      return { encoder, model };
    }

    async function analyzeSentiment(text, encoder, model) {
      const embeddings = await encoder.embed([text]);
      const prediction = await model.predict(embeddings);
      const sentiment = prediction.dataSync()[0] > 0.5 ? 'Positive' : 'Negative';
      const score = prediction.dataSync()[0];
      return { sentiment, score };
    }

    async function updateSentiment() {
      const text = document.getElementById('input').value;
      const { sentiment, score } = await analyzeSentiment(text, encoder, model);
      document.getElementById('result').textContent = `Sentiment: ${sentiment} (Score: ${score.toFixed(2)})`;
      updateChart(score);
    }

    let chart;
    function updateChart(score) {
      if (!chart) {
        chart = new Chart(document.getElementById('chart'), {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'Sentiment Score',
              data: [],
              borderColor: 'blue',
              fill: false
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                min: 0,
                max: 1
              }
            }
          }
        });
      }
      chart.data.labels.push(new Date().toLocaleTimeString());
      chart.data.datasets[0].data.push(score);
      chart.update();
    }

    let encoder, model;
    loadModel().then(({ encoder: loadedEncoder, model: loadedModel }) => {
      encoder = loadedEncoder;
      model = loadedModel;
      document.getElementById('input').addEventListener('input', updateSentiment);
    });
