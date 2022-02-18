import app from './app';
import chalk from 'chalk';

app.listen(app.get('port'), () => {
  console.log(`Server on port ${chalk.greenBright(app.get('port'))} ✔`);
});
