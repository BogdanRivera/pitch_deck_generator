import os
import csv
import re
from flask import Flask, request, render_template, jsonify
import requests
from openai import OpenAI  

app = Flask(__name__)
API_KEY = ""
BASE_URL = "https://integrate.api.nvidia.com/v1"

client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY
)

CSV_FILENAME = "datos_adquiridos.csv"
CSV_HEADERS = [
    "Nombre de la empresa",
    "Descripción corta",
    "Categoría",
    "Problema y solución",
    "Producto o servicio",
    "Pitch Deck generado (sin <think>)",
    "Evaluación del usuario"
]

@app.route("/")
def formulario():
    return render_template("index.html")

@app.route("/generar_prompt", methods=["POST"])
def generar_prompt():
    nombre_de_la_empresa = request.form["nombre_de_la_empresa"]
    descripcion_corta = request.form["descripcion_corta"]
    categoria = request.form["categoria"]
    problema_y_solucion = request.form["problema_y_solucion"]
    producto_o_servicio = request.form["producto_o_servicio"]

    consulta = f"""
        Elabora un pitch deck efectivo y exitoso para poder presentar mi proyecto ante patrocinadores que apoyen mi empresa {nombre_de_la_empresa} dedicada a {descripcion_corta}
        en la categoría de {categoria} y que busca solucionar {problema_y_solucion}, con {producto_o_servicio}. La respuesta generala en español. 
    """

    completion = client.chat.completions.create(
        model="deepseek-ai/deepseek-r1",
        messages=[{"role": "user", "content": consulta}],
        temperature=0.6,
        top_p=0.7,
        max_tokens=4096,
        stream=True
    )

    respuesta_api = ""
    for chunk in completion:
        if chunk.choices[0].delta.content is not None:
            respuesta_api += chunk.choices[0].delta.content

    # Eliminamos contenido dentro de <think></think>
    respuesta_api = re.sub(r"<think>.*?</think>", "", respuesta_api, flags=re.DOTALL)

    return jsonify({"respuesta": respuesta_api})

@app.route("/enviar_datos", methods=["POST"])
def enviar_datos():
    nombre_de_la_empresa = request.form["nombre_de_la_empresa"]
    descripcion_corta = request.form["descripcion_corta"]
    categoria = request.form["categoria"]
    problema_y_solucion = request.form["problema_y_solucion"]
    producto_o_servicio = request.form["producto_o_servicio"]
    respuesta_api = request.form["respuesta_api"]
    evaluacion_usuario = request.form["evaluacion_usuario"]

    print("---- DATOS RECIBIDOS ----")
    print(f"Nombre de la empresa: {nombre_de_la_empresa}")
    print(f"Descripción corta: {descripcion_corta}")
    print(f"Categoría: {categoria}")
    print(f"Problema y solución: {problema_y_solucion}")
    print(f"Producto o servicio: {producto_o_servicio}")
    print(f"Pitch Deck generado (sin <think>): {respuesta_api}")
    print(f"Evaluación del usuario: {evaluacion_usuario}")
    print("-------------------------")

    # Comprobar si el archivo CSV ya existe
    archivo_existe = os.path.exists(CSV_FILENAME)

    # Guardar datos en CSV con validación de encabezados
    with open(CSV_FILENAME, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        # Si el archivo no existe, escribir los encabezados primero
        if not archivo_existe:
            writer.writerow(CSV_HEADERS)

        # Agregar la nueva fila de datos
        writer.writerow([
            nombre_de_la_empresa,
            descripcion_corta,
            categoria,
            problema_y_solucion,
            producto_o_servicio,
            respuesta_api,  # Sin <think></think>
            evaluacion_usuario
        ])

    return "Datos enviados y almacenados en CSV.", 200

if __name__ == "__main__":
    app.run(debug=True)
