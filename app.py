from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'atw_secret_key_123'

# Konfigurasi Database (SQLite)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'portfolio_v2.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- MODELS (UPGRADED FOR MODERN DETAILS) ---

class Experience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    role_en = db.Column(db.String(100))
    company = db.Column(db.String(100), nullable=False)
    date_range = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    description_en = db.Column(db.Text)
    tags = db.Column(db.String(255))

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    title_en = db.Column(db.String(100))
    description = db.Column(db.Text, nullable=False)
    description_en = db.Column(db.Text)
    
    # New Modern Detail Fields
    tech_stack = db.Column(db.String(255)) # e.g. "Python, Odoo 15, PostgreSQL"
    role = db.Column(db.String(100))
    role_en = db.Column(db.String(100))
    challenge = db.Column(db.Text)
    challenge_en = db.Column(db.Text)
    
    image_filename = db.Column(db.String(100), default='project-1.png')
    link = db.Column(db.String(255), default='#')

class BlogPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    title_en = db.Column(db.String(100))
    description = db.Column(db.Text, nullable=False)
    description_en = db.Column(db.Text)
    date_badge = db.Column(db.String(20), nullable=False)
    image_filename = db.Column(db.String(100), default='project-1.png')

class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=True)
    services = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()
    # Seed data profesional otomatis (V2)
    if not Experience.query.first():
        db.session.add(Experience(
            role="IT Programmer-Odoo Developer",
            role_en="IT Programmer-Odoo Developer",
            company="PT. Prima Makmur Rotokemindo",
            date_range="2025 - Present",
            description="Mengembangkan dan memelihara sistem ERP Odoo di berbagai modul.",
            description_en="Developing and maintaining Odoo ERP systems across various modules.",
            tags="Python, Odoo 15, PostgreSQL"
        ))
        db.session.commit()

# --- ROUTES ---

@app.route('/')
def home():
    lang = session.get('lang', 'id')
    experiences = Experience.query.order_by(Experience.id.desc()).all()
    projects = Project.query.all()
    blogs = BlogPost.query.order_by(BlogPost.id.desc()).all()
    return render_template('index.html', experiences=experiences, projects=projects, blogs=blogs, lang=lang)

@app.route('/set_lang/<ln>')
def set_lang(ln):
    session['lang'] = ln
    return redirect(request.referrer or url_for('home'))

@app.route('/contact', methods=['POST'])
def contact():
    try:
        data = request.json
        new_message = ContactMessage(
            name=data.get('name'),
            email=data.get('email'),
            message=data.get('message'),
            services=", ".join(data.get('services', []))
        )
        db.session.add(new_message)
        db.session.commit()
        return jsonify({"status": "success", "message": "Pesan anda berhasil disimpan!"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/ai/query', methods=['POST'])
def ai_query():
    data = request.json
    question = data.get('question', '').lower()
    knowledge = {
        "odoo": "Odoo adalah software ERP all-in-one. Aldi ahli dalam kustomisasi Odoo 15 & 17.",
        "python": "Python adalah bahasa utama Aldi.",
        "skills": "Keahlian utama: Python, Odoo, PostgreSQL, JavaScript."
    }
    answer = knowledge.get(question, "Maaf, saya belum mengerti itu. Coba tanya tentang 'Odoo' atau 'Python'.")
    return jsonify({"answer": answer})

# --- ADMIN ROUTES ---

def is_logged_in():
    return session.get('admin_logged_in')

@app.route('/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form['username'] == 'admin' and request.form['password'] == 'admin123':
            session['admin_logged_in'] = True
            return redirect(url_for('admin_dashboard'))
    return render_template('login.html')

@app.route('/admin')
def admin_dashboard():
    if not is_logged_in(): return redirect(url_for('login'))
    messages = ContactMessage.query.all()
    return render_template('admin/dashboard.html', messages=messages)

@app.route('/admin/experience', methods=['GET', 'POST'])
def admin_experience():
    if not is_logged_in(): return redirect(url_for('login'))
    if request.method == 'POST':
        new_exp = Experience(
            role=request.form['role'],
            role_en=request.form['role_en'],
            company=request.form['company'],
            date_range=request.form['date_range'],
            description=request.form['description'],
            description_en=request.form['description_en'],
            tags=request.form['tags']
        )
        db.session.add(new_exp)
        db.session.commit()
        return redirect(url_for('admin_experience'))
    exps = Experience.query.all()
    return render_template('admin/experience.html', experiences=exps)

@app.route('/admin/experience/edit/<int:id>', methods=['GET', 'POST'])
def edit_experience(id):
    if not is_logged_in(): return redirect(url_for('login'))
    exp = Experience.query.get_or_404(id)
    if request.method == 'POST':
        exp.role = request.form['role']
        exp.role_en = request.form['role_en']
        exp.company = request.form['company']
        exp.date_range = request.form['date_range']
        exp.description = request.form['description']
        exp.description_en = request.form['description_en']
        exp.tags = request.form['tags']
        db.session.commit()
        return redirect(url_for('admin_experience'))
    return render_template('admin/edit_experience.html', exp=exp)

@app.route('/admin/experience/delete/<int:id>')
def delete_experience(id):
    if not is_logged_in(): return redirect(url_for('login'))
    exp = Experience.query.get(id)
    db.session.delete(exp)
    db.session.commit()
    return redirect(url_for('admin_experience'))

@app.route('/admin/project', methods=['GET', 'POST'])
def admin_project():
    if not is_logged_in(): return redirect(url_for('login'))
    if request.method == 'POST':
        new_proj = Project(
            title=request.form['title'],
            title_en=request.form['title_en'],
            description=request.form['description'],
            description_en=request.form['description_en'],
            tech_stack=request.form['tech_stack'],
            role=request.form['role'],
            role_en=request.form['role_en'],
            challenge=request.form['challenge'],
            challenge_en=request.form['challenge_en'],
            link=request.form['link'],
            image_filename=request.form['image_filename']
        )
        db.session.add(new_proj)
        db.session.commit()
        return redirect(url_for('admin_project'))
    projs = Project.query.all()
    return render_template('admin/project.html', projects=projs)

@app.route('/admin/project/edit/<int:id>', methods=['GET', 'POST'])
def edit_project(id):
    if not is_logged_in(): return redirect(url_for('login'))
    proj = Project.query.get_or_404(id)
    if request.method == 'POST':
        proj.title = request.form['title']
        proj.title_en = request.form['title_en']
        proj.description = request.form['description']
        proj.description_en = request.form['description_en']
        proj.tech_stack = request.form['tech_stack']
        proj.role = request.form['role']
        proj.role_en = request.form['role_en']
        proj.challenge = request.form['challenge']
        proj.challenge_en = request.form['challenge_en']
        proj.link = request.form['link']
        proj.image_filename = request.form['image_filename']
        db.session.commit()
        return redirect(url_for('admin_project'))
    return render_template('admin/edit_project.html', proj=proj)

@app.route('/admin/project/delete/<int:id>')
def delete_project(id):
    if not is_logged_in(): return redirect(url_for('login'))
    proj = Project.query.get(id)
    db.session.delete(proj)
    db.session.commit()
    return redirect(url_for('admin_project'))

@app.route('/admin/blog', methods=['GET', 'POST'])
def admin_blog():
    if not is_logged_in(): return redirect(url_for('login'))
    if request.method == 'POST':
        new_blog = BlogPost(
            title=request.form['title'],
            title_en=request.form['title_en'],
            description=request.form['description'],
            description_en=request.form['description_en'],
            date_badge=request.form['date_badge'],
            image_filename=request.form['image_filename']
        )
        db.session.add(new_blog)
        db.session.commit()
        return redirect(url_for('admin_blog'))
    blogs = BlogPost.query.all()
    return render_template('admin/blog.html', blogs=blogs)

@app.route('/admin/blog/edit/<int:id>', methods=['GET', 'POST'])
def edit_blog(id):
    if not is_logged_in(): return redirect(url_for('login'))
    blog = BlogPost.query.get_or_404(id)
    if request.method == 'POST':
        blog.title = request.form['title']
        blog.title_en = request.form['title_en']
        blog.description = request.form['description']
        blog.description_en = request.form['description_en']
        blog.date_badge = request.form['date_badge']
        blog.image_filename = request.form['image_filename']
        db.session.commit()
        return redirect(url_for('admin_blog'))
    return render_template('admin/edit_blog.html', blog=blog)

@app.route('/admin/blog/delete/<int:id>')
def delete_blog(id):
    if not is_logged_in(): return redirect(url_for('login'))
    blog = BlogPost.query.get(id)
    db.session.delete(blog)
    db.session.commit()
    return redirect(url_for('admin_blog'))

if __name__ == '__main__':
    app.run(debug=True)
