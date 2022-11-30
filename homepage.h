#ifndef HOMEPAGE_H
#define HOMEPAGE_H

#include <QMainWindow>
#include <QGraphicsScene.h>
#include <QGraphicsView>

namespace Ui {
class homepage;
}

class homepage : public QMainWindow
{
    Q_OBJECT
public:
    explicit homepage(QGraphicsScene *scene);
    ~homepage();

private:
    QGraphicsScene *scene;

private slots:
     void start_story_mode();

     void on_Log_clicked();

     void on_Sign_clicked();

private:
    Ui::homepage *ui;
};

#endif // HOMEPAGE_H
