from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Инициализация базы данных
db = SQLAlchemy(app)

# Модель данных для примера (автомобильный сервис - STO)
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_name = db.Column(db.String(100), nullable=False)
    car_model = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(200), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='В ожидании')
    price = db.Column(db.Float, default=0.0)

    def __repr__(self):
        return f'<Service {self.id}: {self.client_name}>'


# Главная страница
@app.route('/')
def index():
    services = Service.query.order_by(Service.date_created.desc()).all()
    return render_template('index.html', services=services)


# Добавление новой записи
@app.route('/add', methods=['GET', 'POST'])
def add_service():
    if request.method == 'POST':
        client_name = request.form['client_name']
        car_model = request.form['car_model']
        service_type = request.form['service_type']
        price = float(request.form['price']) if request.form['price'] else 0.0
        
        new_service = Service(
            client_name=client_name,
            car_model=car_model,
            service_type=service_type,
            price=price
        )
        
        try:
            db.session.add(new_service)
            db.session.commit()
            flash('Запись успешно добавлена!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Ошибка при добавлении записи: {str(e)}', 'error')
            return redirect(url_for('add_service'))
    
    return render_template('add.html')


# Обновление записи
@app.route('/update/<int:id>', methods=['GET', 'POST'])
def update_service(id):
    service = Service.query.get_or_404(id)
    
    if request.method == 'POST':
        service.client_name = request.form['client_name']
        service.car_model = request.form['car_model']
        service.service_type = request.form['service_type']
        service.status = request.form['status']
        service.price = float(request.form['price']) if request.form['price'] else 0.0
        
        try:
            db.session.commit()
            flash('Запись успешно обновлена!', 'success')
            return redirect(url_for('index'))
        except Exception as e:
            flash(f'Ошибка при обновлении записи: {str(e)}', 'error')
            return redirect(url_for('update_service', id=id))
    
    return render_template('update.html', service=service)


# Удаление записи
@app.route('/delete/<int:id>')
def delete_service(id):
    service = Service.query.get_or_404(id)
    
    try:
        db.session.delete(service)
        db.session.commit()
        flash('Запись успешно удалена!', 'success')
    except Exception as e:
        flash(f'Ошибка при удалении записи: {str(e)}', 'error')
    
    return redirect(url_for('index'))


# Инициализация базы данных
def init_db():
    with app.app_context():
        db.create_all()
        print("База данных успешно создана!")


if __name__ == '__main__':
    # Создаем базу данных если её нет
    if not os.path.exists('instance/database.db'):
        init_db()
    
    app.run(debug=True, host='0.0.0.0', port=5000)