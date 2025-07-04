# pitch_deck_generator

# 🚀 Configuración del Entorno Virtual en Python

Este repositorio contiene un proyecto en Python que usa un entorno virtual (`.venv`). Sigue estos pasos para configurarlo correctamente después de clonar el repositorio.

## 📥 Clonar el repositorio
Primero, descarga el proyecto desde GitHub:
```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd tu_repositorio
```
## 🏗️ Crear el entorno virtual
Para asegurarte de que las dependencias se instalen en un entorno aislado, crea un entorno virtual:
```
python -m venv .venv
```
## 🔥 Activar el entorno virtual
Después de crear el entorno, actívalo:
```
.venv\Scripts\Activate
```

## 📦 Instalar dependencias
Una vez activado el entorno, instala las librerías necesarias desde requirements.txt:
```
pip install -r requirements.txt
```

Recordar que se debe agregar la API KEY de NVIDIA en el archivo app.py 